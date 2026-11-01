(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const api = window.WeightStore;
  let store;
  try { store = api.createStore(window.localStorage); }
  catch (error) {
    const notice = $('notice');
    notice.hidden = false;
    notice.textContent = '浏览器存储无法读取，或数据格式异常。已保留原数据，请检查浏览器存储设置后重试。';
    document.querySelectorAll('form button, #profile-add, #profile-edit, #group-create').forEach(button => { button.disabled = true; });
    return;
  }
  let editingRecord = null;
  let editingProfile = null;
  const today = () => api.localDateKey();
  const showNotice = text => { $('notice').textContent = text; $('notice').hidden = !text; };
  const safe = (action) => { try { action(); } catch (error) { showNotice(error.code === 'STORAGE_CONFLICT' ? '其他页面已更新数据，请刷新页面后再试，当前输入不会自动保存。' : (error.message || '操作失败，请重试')); } };
  const element = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };

  function renderChart(records) {
    const host = $('chart-container');
    let empty = $('chart-empty');
    if (!empty) { empty = element('div', '保存第一条记录后，这里会显示体重趋势。', 'chart-empty'); empty.id = 'chart-empty'; }
    host.replaceChildren();
    if (!records.length) { host.appendChild(empty); empty.hidden = false; return; }
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 600 200');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `体重趋势图，共 ${records.length} 条记录，最新 ${records.at(-1).weight} 公斤`);
    const vals = records.map(r => r.weight);
    const low = Math.min(...vals), high = Math.max(...vals), pad = Math.max((high-low)*0.2, 1);
    const points = records.map((r, i) => ({ x: records.length === 1 ? 300 : 35 + i*530/(records.length-1), y: 165-(r.weight-low+pad)/(high-low+pad*2)*130 }));
    const axis = document.createElementNS(ns, 'line');
    for (const [k,v] of Object.entries({x1:35,y1:165,x2:565,y2:165,stroke:'#dbe5f1','stroke-width':1})) axis.setAttribute(k,v);
    svg.appendChild(axis);
    if (points.length > 1) { const line = document.createElementNS(ns, 'polyline'); line.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' ')); line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#2864d7'); line.setAttribute('stroke-width', '3'); line.setAttribute('stroke-linejoin', 'round'); svg.appendChild(line); }
    points.forEach((p,i) => { const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx',p.x); circle.setAttribute('cy',p.y); circle.setAttribute('r','4'); circle.setAttribute('fill','#2864d7'); const title=document.createElementNS(ns,'title');title.textContent=`${records[i].date} · ${records[i].weight} kg`;circle.appendChild(title);svg.appendChild(circle); });
    const label=document.createElementNS(ns,'text');label.setAttribute('x','35');label.setAttribute('y','190');label.setAttribute('fill','#657b99');label.setAttribute('font-size','13');label.textContent=records[0].date;svg.appendChild(label);
    const end=document.createElementNS(ns,'text');end.setAttribute('x','565');end.setAttribute('y','190');end.setAttribute('text-anchor','end');end.setAttribute('fill','#657b99');end.setAttribute('font-size','13');end.textContent=records.at(-1).date;svg.appendChild(end);
    host.appendChild(svg);
  }

  function resetRecordForm() { editingRecord=null; $('record-form').reset(); $('record-date').value=today(); $('record-date').max=today(); $('record-submit').textContent='保存记录'; $('record-cancel').hidden=true; if ($('form-title')) $('form-title').textContent='记录体重'; }
  function renderRecords(records) {
    const list=$('record-list'); list.replaceChildren();
    if ($('records-summary')) $('records-summary').textContent=records.length ? `共 ${records.length} 条记录` : '还没有记录';
    if (!records.length) list.appendChild(element('p', '还没有记录。保存第一条体重后，会显示在这里。', 'list-empty'));
    [...records].reverse().forEach(record => {
      const row=element('li',null,'record-item');
      const details=element('div',null,'record-details');
      const first=element('div',null,'record-primary');first.append(element('strong',`${record.weight.toFixed(1)} kg`), element('time',record.date));
      details.appendChild(first);if(record.note) details.appendChild(element('p',record.note,'record-note'));
      const actions=element('div',null,'record-actions');
      const edit=element('button','编辑','record-action');edit.type='button';edit.setAttribute('aria-label',`编辑 ${record.date} 的记录`);
      edit.onclick=()=>{editingRecord=record.id;$('record-date').value=record.date;$('record-weight').value=record.weight;$('record-note').value=record.note || '';$('record-submit').textContent='保存修改';$('record-cancel').hidden=false;if($('form-title'))$('form-title').textContent='编辑记录';$('record-weight').focus();};
      const del=element('button','删除','record-action danger');del.type='button';del.setAttribute('aria-label',`删除 ${record.date} 的记录`);
      del.onclick=()=>{if(!window.confirm(`删除 ${record.date} 的 ${record.weight} kg 记录？`))return;safe(()=>{store.deleteRecord(record.id);if(editingRecord===record.id)resetRecordForm();showNotice('记录已删除');render();});};
      actions.append(edit,del);row.append(details,actions);list.appendChild(row);
    });
  }
  function renderGroups(user) {
    const list=$('group-list'); if(!list)return;list.replaceChildren();if ($('group-create')) $('group-create').disabled=!user;const groups=store.listGroups();
    if (!groups.length) { list.appendChild(element('p','还没有小组。可以创建一个，在本机体验加入和退出。','group-empty')); return; }
    groups.forEach(group => {
      const row=element('div',null,'group-item');const info=element('div',null,'group-info');
      info.append(element('strong',group.name),element('span',`${group.memberIds.length} 位本机成员`));
      const joined=user && group.memberIds.includes(user.id);const btn=element('button',joined?'退出':'加入', 'group-action');btn.type='button';btn.disabled=!user;
      btn.onclick=()=>safe(()=>{if(joined)store.leaveGroup(group.id);else store.joinGroup(group.id);showNotice(joined?'已退出本机小组':'已加入本机小组');render();});row.append(info,btn);list.appendChild(row);
    });
  }
  function render() {
    const users=store.listUsers(), user=store.getActiveUser();
    if ($('empty-state')) $('empty-state').hidden=!!user;
    const select=$('profile-select');select.replaceChildren();
    if (!users.length) { const op=element('option','请先创建使用者');op.value='';select.appendChild(op); }
    users.forEach(u=>{const opt=element('option',u.name);opt.value=u.id;select.appendChild(opt);});select.value=user?.id || '';select.disabled=!user;
    $('profile-edit').disabled=!user; $('record-submit').disabled=!user;
    const records=user ? store.listRecords(user.id) : [];
    const first=records[0], last=records.at(-1);
    $('latest-value').textContent=last?last.weight.toFixed(1):'--';
    $('goal-value').textContent=user?.goal != null?Number(user.goal).toFixed(1):'--';
    const diff=first&&last?Math.round((last.weight-first.weight)*10)/10:null;
    $('change-value').textContent=diff==null?'--':`${diff>0?'+':''}${diff.toFixed(1)}`;
    $('entry-count').textContent=String(records.length);
    if($('profile-summary')) $('profile-summary').textContent=user?`当前使用者：${user.name}`:'创建本机使用者后开始记录';
    renderChart(records);renderRecords(records);renderGroups(user);
  }
  $('profile-add').addEventListener('click',()=>{editingProfile=null;$('profile-form').reset();if($('profile-dialog-title'))$('profile-dialog-title').textContent='创建使用者';$('profile-dialog').showModal();$('profile-name').focus();});
  $('profile-edit').addEventListener('click',()=>{const u=store.getActiveUser();if(!u)return;editingProfile=u.id;$('profile-name').value=u.name;$('profile-goal').value=u.goal??'';if($('profile-dialog-title'))$('profile-dialog-title').textContent='编辑使用者';$('profile-dialog').showModal();$('profile-name').focus();});
  $('profile-form').addEventListener('submit',e=>{e.preventDefault();safe(()=>{const data={name:$('profile-name').value.trim(),goal:$('profile-goal').value.trim() || null};if(editingProfile)store.updateUser(editingProfile,data);else store.createUser(data);$('profile-dialog').close();resetRecordForm();showNotice('使用者已保存');render();});});
  $('profile-select').addEventListener('change',e=>safe(()=>{store.switchUser(e.target.value);resetRecordForm();showNotice('已切换本机使用者');render();}));
  $('record-form').addEventListener('submit',e=>{e.preventDefault();safe(()=>{const data={date:$('record-date').value,weight:$('record-weight').value,note:$('record-note').value};if(editingRecord)store.updateRecord(editingRecord,data);else store.addRecord(data);resetRecordForm();showNotice('记录已保存在本机浏览器');render();});});
  $('record-cancel').addEventListener('click',resetRecordForm);
  if($('group-create'))$('group-create').addEventListener('click',()=>{$('group-form').reset();$('group-dialog').showModal();$('group-name').focus();});
  if($('group-form'))$('group-form').addEventListener('submit',e=>{e.preventDefault();safe(()=>{store.createGroup($('group-name').value.trim());$('group-dialog').close();showNotice('本机小组已创建并加入');render();});});
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  resetRecordForm();render();
})();
