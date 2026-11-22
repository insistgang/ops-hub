import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import collector


class GitOpsDirtyWorktreeGuardTests(unittest.TestCase):
    """脏工作区保护只拦暂存区：未暂存的他人改动不应阻断托管产物的提交。"""

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.git('init', '-b', 'main')
        self.git('config', 'user.name', 'tester')
        self.git('config', 'user.email', 'tester@example.com')
        for rel in collector.GITOPS_FILES:
            path = self.repo / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('{}\n', encoding='utf-8')
        self.git('add', *collector.GITOPS_FILES)
        self.git('commit', '-m', 'init')
        patcher = patch.object(collector, 'BASE_DIR', self.repo)
        patcher.start()
        self.addCleanup(patcher.stop)

    def git(self, *args):
        return subprocess.run(
            ['git', '-C', str(self.repo), *args],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True,
        )

    def touch_managed(self, content='{"ok": false}\n'):
        path = self.repo / 'data' / 'public' / 'status.json'
        path.write_text(content, encoding='utf-8')

    def committed_paths(self):
        return self.git('show', '--name-only', '--format=', 'HEAD').stdout.split()

    def test_unstaged_foreign_change_does_not_block_commit(self):
        self.touch_managed()
        (self.repo / 'ROADMAP.md').write_text('draft\n', encoding='utf-8')
        self.assertTrue(collector.gitops_push())
        self.assertIn('data/public/status.json', self.committed_paths())
        self.assertNotIn('ROADMAP.md', self.committed_paths())

    def test_staged_foreign_change_blocks_commit(self):
        self.touch_managed()
        foreign = self.repo / 'ROADMAP.md'
        foreign.write_text('draft\n', encoding='utf-8')
        self.git('add', 'ROADMAP.md')
        self.assertFalse(collector.gitops_push())

    def test_managed_change_only_is_committed(self):
        self.touch_managed()
        self.assertTrue(collector.gitops_push())
        self.assertIn('{"ok": false}', (self.repo / 'data' / 'public' / 'status.json').read_text(encoding='utf-8'))

    def test_no_managed_change_is_not_a_failure(self):
        """托管产物无变化时应跳过提交并视为成功（不依赖 git 的英文文案）。"""
        self.assertTrue(collector.gitops_push())


if __name__ == '__main__':
    unittest.main()
