import hashlib
import json
import re
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch
import unicodedata

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import knowledge_source
import sanitize_public
import collector


class DiaryTodoProjectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.today = date(2026, 11, 8)

    def write_day(self, day, content):
        path = self.root / '01-Daily' / day.strftime('%Y-%m') / f'{day.isoformat()}.md'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
        return path

    @staticmethod
    def todo_id(day, title):
        normalized = ' '.join(unicodedata.normalize('NFKC', title).split()).casefold()
        return 'diary-' + hashlib.sha256(f'{day}\0{normalized}'.encode()).hexdigest()[:24]

    def test_rollover_only_reads_allowlisted_sections_and_prefers_today_duplicates(self):
        yesterday = date(2026, 11, 7)
        self.write_day(yesterday, '''# diary
## 习惯跟踪
- [ ] NEVER-PUBLISH habit secret
## 今日计划与执行状态
- [ ] 只允许今天章节的任务
## 明日计划
- [ ] Duplicate task
- [x] 明日独有任务
''')
        self.write_day(self.today, '''# diary
## 习惯跟踪
- [x] NEVER-PUBLISH current habit
## 今日计划与执行状态
- [x] Duplicate task
- [ ] 今天未完成
## 工作记录
- [x] NEVER-PUBLISH work log
''')

        result = knowledge_source.parse_diary_todos(self.root, self.today)

        self.assertEqual(result['date'], '2026-11-08')
        self.assertEqual([item['title'] for item in result['items']], [
            'Duplicate task', '今天未完成', '明日独有任务',
        ])
        duplicate = result['items'][0]
        self.assertTrue(duplicate['completed'])
        self.assertEqual(duplicate['source_date'], '2026-11-08')
        self.assertRegex(duplicate['id'], r'^diary-[0-9a-f]{24}$')
        self.assertEqual(len({item['id'] for item in result['items']}), 3)
        blob = json.dumps(result, ensure_ascii=False)
        self.assertNotIn('NEVER-PUBLISH', blob)
        self.assertNotIn('习惯跟踪', blob)

    def test_previous_day_tomorrow_items_are_targeted_to_requested_day(self):
        yesterday = date(2026, 11, 7)
        self.write_day(yesterday, '''## 明日计划
- [ ] 明天事项
- [x] 明天已完成
## 其他
- [ ] 其他事项
''')
        result = knowledge_source.parse_diary_todos(self.root, self.today)
        self.assertEqual(result['date'], '2026-11-08')
        self.assertEqual([item['source_date'] for item in result['items']], ['2026-11-07'] * 2)
        self.assertEqual([item['completed'] for item in result['items']], [False, True])

    def test_rollover_reads_previous_month_file_by_its_calendar_date(self):
        new_year = date(2027, 1, 1)
        self.write_day(date(2026, 12, 31), '''## 明日计划
- [ ] New year task
''')
        result = knowledge_source.parse_diary_todos(self.root, new_year)
        self.assertEqual(result['date'], '2027-01-01')
        self.assertEqual(result['items'][0]['source_date'], '2026-12-31')
        self.assertEqual(result['items'][0]['title'], 'New year task')

    def test_missing_diaries_produce_explicit_empty_snapshot_without_unrelated_fallback(self):
        result = knowledge_source.parse_diary_todos(self.root, self.today)
        self.assertEqual(result, {'date': '2026-11-08', 'items': []})

    def test_managed_public_outputs_are_in_gitops_allowlist(self):
        self.assertIn('data/public/diary-todos.json', collector.GITOPS_FILES)
        self.assertIn('data/public/diary-todos.js', collector.GITOPS_FILES)

    def test_stable_id_uses_nfkc_normalized_title_and_target_date(self):
        self.write_day(self.today, '''## 今日计划与执行状态
- [ ] ＡＢＣ  task
''')
        item = knowledge_source.parse_diary_todos(self.root, self.today)['items'][0]
        normalized = unicodedata.normalize('NFKC', 'ＡＢＣ task').casefold()
        digest = hashlib.sha256(f"2026-11-08\0{normalized}".encode('utf-8')).hexdigest()[:24]
        self.assertEqual(item['id'], 'diary-' + digest)

    def test_long_title_id_matches_the_exact_published_pre_scrub_title(self):
        self.write_day(self.today, '## 今日计划与执行状态\n- [ ] ' + ('长' * 200) + '\n')
        item = knowledge_source.parse_diary_todos(self.root, self.today)['items'][0]
        self.assertEqual(len(item['title']), 160)
        aliases = {'names': {}, 'relations': {}, 'ips': {}, 'paths': {}}
        public = sanitize_public.build_public_diary_todos({
            'today': '2026-11-08',
            'diary_todos': {'date': '2026-11-08', 'items': [item]},
        }, aliases)
        self.assertEqual(public['items'][0]['title'], item['title'])

    def test_public_projection_is_strict_allowlist_scrubbed_and_empty_clears_stale(self):
        aliases = {
            'names': {'PRIVATE-NAME': 'person-A'},
            'relations': {}, 'ips': {}, 'paths': {'/Users/private/diary.md': '~/redacted'},
        }
        knowledge = {'today': '2026-11-08', 'diary_todos': {
            'date': '2026-11-08', 'private_context': 'DO-NOT-PUBLISH',
            'items': [{
                'id': self.todo_id('2026-11-08', 'Call PRIVATE-NAME in /Users/private/diary.md'),
                'title': 'Call PRIVATE-NAME in /Users/private/diary.md',
                'completed': True, 'source_date': '2026-11-07', 'context': 'HIDDEN-CONTEXT',
            }],
        }}
        public = sanitize_public.build_public_diary_todos(knowledge, aliases)
        self.assertEqual(set(public), {'date', 'items'})
        self.assertEqual(set(public['items'][0]), {'id', 'title', 'completed', 'source_date'})
        blob = json.dumps(public, ensure_ascii=False)
        self.assertNotIn('PRIVATE-NAME', blob)
        self.assertNotIn('/Users/private/diary.md', blob)
        self.assertNotIn('HIDDEN-CONTEXT', blob)
        self.assertNotIn('DO-NOT-PUBLISH', blob)
        self.assertIn('person-A', blob)

        with tempfile.TemporaryDirectory() as temp:
            data = Path(temp) / 'data'
            public_dir = data / 'public'
            public_dir.mkdir(parents=True)
            aliases_path = data / 'private_aliases.json'
            aliases_path.write_text(json.dumps(aliases), encoding='utf-8')
            (data / 'status.json').write_text(json.dumps({'knowledge': {
                'today': '2026-11-08', 'diary_todos': {'date': '2026-11-08', 'items': []}},
            }), encoding='utf-8')
            (public_dir / 'diary-todos.json').write_text('stale', encoding='utf-8')
            (public_dir / 'diary-todos.js').write_text('stale', encoding='utf-8')
            with patch.object(sanitize_public, 'DATA_DIR', data), \
                 patch.object(sanitize_public, 'PUBLIC_DIR', public_dir), \
                 patch.object(sanitize_public, 'ALIASES_PATH', aliases_path):
                self.assertTrue(sanitize_public.write_public_files())
            self.assertEqual(json.loads((public_dir / 'diary-todos.json').read_text()),
                             {'date': '2026-11-08', 'items': []})
            script = (public_dir / 'diary-todos.js').read_text(encoding='utf-8')
            self.assertIn('window.__OPS_DIARY_TODOS__', script)
            self.assertIn('"items": []', script)

    def test_invalid_public_payload_and_dates_are_rejected(self):
        aliases = {'names': {}, 'relations': {}, 'ips': {}, 'paths': {}}
        valid_id = self.todo_id('2026-11-08', 'x')
        for value in (
            {'date': 'yesterday', 'items': []},
            {'date': '2026-11-08', 'items': [{'id': '../bad', 'title': 'x', 'completed': False, 'source_date': '2026-11-08'}]},
            {'date': '2026-11-08', 'items': [{'id': valid_id, 'title': 'x', 'completed': 1, 'source_date': '2026-11-08'}]},
            {'date': '2026-11-08', 'items': [{'id': valid_id, 'title': 'x', 'completed': False, 'source_date': '2026-11-06'}]},
        ):
            with self.subTest(payload=value):
                with self.assertRaises(ValueError):
                    sanitize_public.build_public_diary_todos({'diary_todos': value}, aliases)

    def test_unregistered_filesystem_paths_are_removed_from_titles(self):
        title = 'Inspect /home/private/diary.md and ~/Documents/notes.md'
        day = '2026-11-08'
        payload = {'diary_todos': {'date': day, 'items': [{
            'id': self.todo_id(day, title), 'title': title,
            'completed': False, 'source_date': day,
        }]}}
        aliases = {'names': {}, 'relations': {}, 'ips': {}, 'paths': {}}
        public = sanitize_public.build_public_diary_todos(payload, aliases)
        blob = json.dumps(public, ensure_ascii=False)
        self.assertNotIn('/home/private/diary.md', blob)
        self.assertNotIn('~/Documents/notes.md', blob)
        self.assertIn('[路径已隐藏]', blob)


if __name__ == '__main__':
    unittest.main(verbosity=2)
