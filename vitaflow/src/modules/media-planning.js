        function addAnalysisItem() {
            const analysisList = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const newItem = {
                id: Date.now(),
                name: '',
                platform: '',
                strengths: `【优势分析引导】
1. 内容定位：这个创作者的核心受众是谁？他们解决了什么问题？
2. 内容形式：他们常用什么形式（图文/视频/直播等）？
3. 差异化：他们与同类创作者有什么不同？
4. 数据表现：他们的平均播放/点赞/评论数据如何？
5. 变现模式：他们是怎么变现的（广告/直播/课程等）？`,
                weaknesses: `【可改进之处引导】
1. 更新频率：是否有断更或更新不稳定的问题？
2. 内容质量：哪些方面可以进一步提升？
3. 互动性：与粉丝的互动如何？
4. 差异化：是否有同质化问题？
5. 品牌建设：个人品牌辨识度如何？`,
                insights: `【洞察与启发引导】
1. 我可以学习的3个点：
   -
   -
   -
2. 我可以借鉴的创作方法：
   -
   -
3. 跟进计划：
   - 下一步我要尝试什么？
   - 什么时候再复盘这次分析？`,
                images: [],
                created: new Date().toISOString()
            };
            analysisList.unshift(newItem);
            localStorage.setItem('vitaflow_analysis', JSON.stringify(analysisList));
            renderAnalysisList();
            openAnalysisDetail(newItem.id);
        }

        function renderAnalysisList() {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const el = document.getElementById('analysisList');
            if (list.length === 0) {
                el.innerHTML = `
                    <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(102, 126, 234, 0.2);">
                        <div style="font-size: 1.2rem; font-weight: 700; color: #667eea; margin-bottom: 16px;">🎯 对标分析引导</div>
                        <div style="color: #6a4a7a; line-height: 1.8;">
                            <p style="margin-bottom: 12px;"><strong>为什么要做对标分析？</strong></p>
                            <ul style="margin-left: 20px; margin-bottom: 16px;">
                                <li>学习优秀创作者的成功经验</li>
                                <li>找到自己的差异化定位</li>
                                <li>避免走弯路，快速成长</li>
                            </ul>
                            <p style="margin-bottom: 8px;"><strong>如何有效使用这个模块：</strong></p>
                            <ol style="margin-left: 20px;">
                                <li>点击上方按钮添加对标创作者</li>
                                <li>填写优势、可改进之处和你的洞察</li>
                                <li>定期跟进（建议每周复盘一次）</li>
                                <li>把学到的东西应用到自己的创作中</li>
                            </ol>
                        </div>
                    </div>
                    <div style="text-align: center; color: #aa9a9a; padding: 20px;">暂无对标分析记录，点击上方按钮开始第一个分析吧！</div>
                `;
                return;
            }
            el.innerHTML = list.map(item => `
                <div class="doc-card" onclick="openAnalysisDetail(${inlineHandlerArg(item.id)})">
                    <div class="doc-title"><span>${escapeHtml(item.name) || '未命名创作者'}</span></div>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        ${item.platform ? `<span style="font-size: 0.75rem; color: #8b5e9e; background: rgba(139, 94, 158, 0.1); padding: 4px 8px; border-radius: 8px;">${escapeHtml(item.platform)}</span>` : ''}
                        ${item.images.length > 0 ? `<span style="font-size: 0.75rem; color: #c4679c;">📷 ${item.images.length}张图</span>` : ''}
                    </div>
                    <div class="doc-preview">${escapeHtml(item.insights) || '暂无分析内容'}</div>
                    <div class="doc-meta">${new Date(item.created).toLocaleDateString()}</div>
                </div>
            `).join('');
        }

        function openAnalysisDetail(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const item = list.find(i => i.id === id);
            if (!item) return;

            document.getElementById('ideas-analysis').innerHTML = `
                <div class="record-form">
                    <div class="form-group">
                        <label class="form-label">创作者名称</label>
                        <input type="text" class="form-input" id="analysisName" value="${escapeHtml(item.name)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">平台</label>
                        <input type="text" class="form-input" id="analysisPlatform" value="${escapeHtml(item.platform)}" placeholder="如：B站、小红书、抖音等">
                    </div>
                    <div class="form-group">
                        <label class="form-label">优势分析</label>
                        <textarea class="text-editor" id="analysisStrengths">${escapeHtml(item.strengths)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">可改进之处</label>
                        <textarea class="text-editor" id="analysisWeaknesses">${escapeHtml(item.weaknesses)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">洞察与启发</label>
                        <textarea class="text-editor" id="analysisInsights">${escapeHtml(item.insights)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">上传图片</label>
                        <input type="file" id="analysisImageInput" accept="image/*" multiple style="display: none;">
                        <button class="add-btn" style="width: 100%; background: rgba(139, 94, 158, 0.3);" onclick="document.getElementById('analysisImageInput').click()">📷 选择图片</button>
                        <div id="analysisImagesPreview" style="margin-top: 12px;">
                            ${item.images.map((img, idx) => `<img src="${escapeHtml(img)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" onclick="removeAnalysisImage(${inlineHandlerArg(id)}, ${idx})">`).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #667eea, #764ba2);" onclick="saveAnalysis(${inlineHandlerArg(id)})">💾 保存</button>
                        <button class="add-btn" style="background: rgba(200, 160, 200, 0.3);" onclick="renderAnalysisList()">返回列表</button>
                    </div>
                </div>
            `;

            document.getElementById('analysisImageInput').addEventListener('change', function(e) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
                        const item = list.find(i => i.id === id);
                        if (item) {
                            item.images.push(event.target.result);
                            localStorage.setItem('vitaflow_analysis', JSON.stringify(list));
                            document.getElementById('analysisImagesPreview').innerHTML += `<img src="${escapeHtml(event.target.result)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">`;
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            });
        }

        function removeAnalysisImage(itemId, imgIndex) {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const item = list.find(i => i.id === itemId);
            if (item) {
                item.images.splice(imgIndex, 1);
                localStorage.setItem('vitaflow_analysis', JSON.stringify(list));
                openAnalysisDetail(itemId);
            }
        }

        function saveAnalysis(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const index = list.findIndex(i => i.id === id);
            if (index >= 0) {
                list[index].name = document.getElementById('analysisName').value;
                list[index].platform = document.getElementById('analysisPlatform').value;
                list[index].strengths = document.getElementById('analysisStrengths').value;
                list[index].weaknesses = document.getElementById('analysisWeaknesses').value;
                list[index].insights = document.getElementById('analysisInsights').value;
                localStorage.setItem('vitaflow_analysis', JSON.stringify(list));
                alert('✅ 已保存');
                document.getElementById('ideas-analysis').innerHTML = '<div style="margin-bottom: 16px;"><button class="add-btn" style="background: linear-gradient(135deg, #667eea, #764ba2);" onclick="addAnalysisItem()">+ 添加创作者分析</button></div><div id="analysisList"></div>';
                renderAnalysisList();
            }
        }

        function addIPItem() {
            const ipList = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const newItem = {
                id: Date.now(),
                title: '',
                audience: `【目标受众分析引导】
1. 核心画像：
   - 年龄：
   - 性别：
   - 地域：
   - 职业/身份：

2. 痛点与需求：
   - 他们目前面临什么问题？
   - 他们渴望获得什么？

3. 触达渠道：
   - 他们活跃在哪些平台？
   - 什么内容形式最吸引他们？`,
                monetization: `【变现模式分析引导】
1. 现有变现方式：
   - 广告收入？
   - 直播打赏？
   - 电商带货？
   - 知识付费？
   - 其他？

2. 变现效率分析：
   - 哪些方式收益最高？
   - 哪些方式投入产出比最好？

3. 可拓展的方向：
   - 还有哪些变现可能？
   - 需要什么资源来实现？`,
                competition: `【竞争格局分析引导】
1. 直接竞争对手：
   - 有哪些同类型的创作者？
   - 他们的优势和劣势是什么？

2. 市场饱和度：
   - 这个赛道拥挤吗？
   - 还有空白机会吗？

3. 差异化机会：
   - 我可以从什么角度切入？
   - 我的独特性在哪里？`,
                opportunities: `【机会与风险分析引导】
1. 短期机会（1-3个月）：
   -
   -

2. 中期机会（3-12个月）：
   -
   -

3. 潜在风险：
   -
   -

4. 跟进计划：
   - 下一步行动是什么？
   - 什么时候重新评估？`,
                images: [],
                created: new Date().toISOString()
            };
            ipList.unshift(newItem);
            localStorage.setItem('vitaflow_ip', JSON.stringify(ipList));
            renderIPList();
            openIPDetail(newItem.id);
        }

        function renderIPList() {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const el = document.getElementById('ipList');
            if (list.length === 0) {
                el.innerHTML = `
                    <div style="background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1)); border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(17, 153, 142, 0.2);">
                        <div style="font-size: 1.2rem; font-weight: 700; color: #11998e; margin-bottom: 16px;">💼 IP商业分析引导</div>
                        <div style="color: #6a4a7a; line-height: 1.8;">
                            <p style="margin-bottom: 12px;"><strong>为什么要做IP商业分析？</strong></p>
                            <ul style="margin-left: 20px; margin-bottom: 16px;">
                                <li>系统性思考你的个人品牌商业模式</li>
                                <li>明确目标受众和变现路径</li>
                                <li>识别市场机会和潜在风险</li>
                                <li>制定可执行的商业计划</li>
                            </ul>
                            <p style="margin-bottom: 8px;"><strong>分析框架建议：</strong></p>
                            <ol style="margin-left: 20px;">
                                <li>目标受众：谁是你的核心用户？</li>
                                <li>变现模式：你打算怎么赚钱？</li>
                                <li>竞争格局：市场上还有谁？</li>
                                <li>机会风险：机遇和挑战是什么？</li>
                            </ol>
                        </div>
                    </div>
                    <div style="text-align: center; color: #aa9a9a; padding: 20px;">暂无IP商业分析记录，点击上方按钮开始你的第一个商业分析！</div>
                `;
                return;
            }
            el.innerHTML = list.map(item => `
                <div class="doc-card" onclick="openIPDetail(${inlineHandlerArg(item.id)})">
                    <div class="doc-title"><span>${escapeHtml(item.title) || '未命名分析'}</span></div>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        ${item.audience ? `<span style="font-size: 0.75rem; color: #11998e; background: rgba(17, 153, 142, 0.1); padding: 4px 8px; border-radius: 8px;">目标受众</span>` : ''}
                        ${item.images.length > 0 ? `<span style="font-size: 0.75rem; color: #c4679c;">📷 ${item.images.length}张图</span>` : ''}
                    </div>
                    <div class="doc-preview">${escapeHtml(item.opportunities) || '暂无分析内容'}</div>
                    <div class="doc-meta">${new Date(item.created).toLocaleDateString()}</div>
                </div>
            `).join('');
        }

        function openIPDetail(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const item = list.find(i => i.id === id);
            if (!item) return;

            document.getElementById('ideas-ip').innerHTML = `
                <div class="record-form">
                    <div class="form-group">
                        <label class="form-label">分析标题</label>
                        <input type="text" class="form-input" id="ipTitle" value="${escapeHtml(item.title)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">目标受众分析</label>
                        <textarea class="text-editor" id="ipAudience">${escapeHtml(item.audience)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">变现方式</label>
                        <textarea class="text-editor" id="ipMonetization">${escapeHtml(item.monetization)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">竞争分析</label>
                        <textarea class="text-editor" id="ipCompetition">${escapeHtml(item.competition)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">机会与风险</label>
                        <textarea class="text-editor" id="ipOpportunities">${escapeHtml(item.opportunities)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">上传图片</label>
                        <input type="file" id="ipImageInput" accept="image/*" multiple style="display: none;">
                        <button class="add-btn" style="width: 100%; background: rgba(17, 153, 142, 0.3);" onclick="document.getElementById('ipImageInput').click()">📷 选择图片</button>
                        <div id="ipImagesPreview" style="margin-top: 12px;">
                            ${item.images.map((img, idx) => `<img src="${escapeHtml(img)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" onclick="removeIPImage(${inlineHandlerArg(id)}, ${idx})">`).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #11998e, #38ef7d);" onclick="saveIP(${inlineHandlerArg(id)})">💾 保存</button>
                        <button class="add-btn" style="background: rgba(200, 160, 200, 0.3);" onclick="renderIPList()">返回列表</button>
                    </div>
                </div>
            `;

            document.getElementById('ipImageInput').addEventListener('change', function(e) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
                        const item = list.find(i => i.id === id);
                        if (item) {
                            item.images.push(event.target.result);
                            localStorage.setItem('vitaflow_ip', JSON.stringify(list));
                            document.getElementById('ipImagesPreview').innerHTML += `<img src="${escapeHtml(event.target.result)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">`;
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            });
        }

        function removeIPImage(itemId, imgIndex) {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const item = list.find(i => i.id === itemId);
            if (item) {
                item.images.splice(imgIndex, 1);
                localStorage.setItem('vitaflow_ip', JSON.stringify(list));
                openIPDetail(itemId);
            }
        }

        function saveIP(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const index = list.findIndex(i => i.id === id);
            if (index >= 0) {
                list[index].title = document.getElementById('ipTitle').value;
                list[index].audience = document.getElementById('ipAudience').value;
                list[index].monetization = document.getElementById('ipMonetization').value;
                list[index].competition = document.getElementById('ipCompetition').value;
                list[index].opportunities = document.getElementById('ipOpportunities').value;
                localStorage.setItem('vitaflow_ip', JSON.stringify(list));
                alert('✅ 已保存');
                document.getElementById('ideas-ip').innerHTML = '<div style="margin-bottom: 16px;"><button class="add-btn" style="background: linear-gradient(135deg, #11998e, #38ef7d);" onclick="addIPItem()">+ 添加商业分析</button></div><div id="ipList"></div>';
                renderIPList();
            }
        }

        function addSkillItem() {
            const skillsList = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const newItem = {
                id: Date.now(),
                name: '',
                category: '',
                progress: 0,
                resources: `【学习资源整理引导】
1. 教程与课程：
   -
   -

2. 参考资料/书籍：
   -
   -

3. 优质博主/创作者：
   -
   -

4. 实用工具：
   -
   - `,
                notes: `【学习笔记与跟进计划引导】
1. 学习目标（SMART原则）：
   - 具体目标是什么？
   - 何时达成？
   - 如何衡量？

2. 阶段计划：
   - 第1周：
   - 第2-4周：
   - 第2个月：

3. 学习笔记：
   - 重要概念记录
   - 遇到的坑与解决方案
   - 顿悟时刻

4. 实践应用计划：
   - 如何将这个技能用到实际中？
   - 计划做什么作品/项目？

5. 跟进复盘：
   - 每周学习成果
   - 遇到的问题
   - 下周计划`,
                images: [],
                created: new Date().toISOString()
            };
            skillsList.unshift(newItem);
            localStorage.setItem('vitaflow_skills', JSON.stringify(skillsList));
            renderSkillsList();
            openSkillDetail(newItem.id);
        }

        function renderSkillsList() {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const el = document.getElementById('skillsList');
            if (list.length === 0) {
                el.innerHTML = `
                    <div style="background: linear-gradient(135deg, rgba(232, 138, 76, 0.1), rgba(212, 112, 160, 0.1)); border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(232, 138, 76, 0.2);">
                        <div style="font-size: 1.2rem; font-weight: 700; color: #e88a4c; margin-bottom: 16px;">🎨 新技能学习引导</div>
                        <div style="color: #6a4a7a; line-height: 1.8;">
                            <p style="margin-bottom: 12px;"><strong>为什么要系统记录学习过程？</strong></p>
                            <ul style="margin-left: 20px; margin-bottom: 16px;">
                                <li>避免碎片化学习，建立知识更系统</li>
                                <li>记录成长轨迹，看见自己的进步</li>
                                <li>整理学习资源，方便回顾查找</li>
                                <li>制定跟进计划，确保学习效果</li>
                            </ul>
                            <p style="margin-bottom: 8px;"><strong>推荐的学习框架：</strong></p>
                            <ol style="margin-left: 20px;">
                                <li>明确目标：用SMART原则制定可衡量的目标</li>
                                <li>收集资源：教程、书籍、博主等</li>
                                <li>分阶段学习：循序渐进</li>
                                <li>实践应用：做项目练手</li>
                                <li>定期复盘：每周回顾调整</li>
                            </ol>
                        </div>
                    </div>
                    <div style="text-align: center; color: #aa9a9a; padding: 20px;">暂无技能学习记录，点击上方按钮开始学习新技能！</div>
                `;
                return;
            }
            el.innerHTML = list.map(item => {
                const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
                return `
                <div class="doc-card" onclick="openSkillDetail(${inlineHandlerArg(item.id)})">
                    <div class="doc-title"><span>${escapeHtml(item.name) || '未命名技能'}</span></div>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        ${item.category ? `<span style="font-size: 0.75rem; color: #e88a4c; background: rgba(232, 138, 76, 0.1); padding: 4px 8px; border-radius: 8px;">${escapeHtml(item.category)}</span>` : ''}
                        <span style="font-size: 0.75rem; color: #8b5e9e;">进度: ${progress}%</span>
                        ${item.images.length > 0 ? `<span style="font-size: 0.75rem; color: #c4679c;">📷 ${item.images.length}张图</span>` : ''}
                    </div>
                    <div style="height: 8px; background: rgba(200, 160, 200, 0.2); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                        <div style="height: 100%; background: linear-gradient(135deg, #e88a4c, #d470a0); width: ${progress}%; transition: width 0.3s;"></div>
                    </div>
                    <div class="doc-preview">${escapeHtml(item.notes) || '暂无学习笔记'}</div>
                    <div class="doc-meta">${new Date(item.created).toLocaleDateString()}</div>
                </div>
            `;
            }).join('');
        }

        function openSkillDetail(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const item = list.find(i => i.id === id);
            if (!item) return;
            const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));

            document.getElementById('ideas-skills').innerHTML = `
                <div class="record-form">
                    <div class="form-group">
                        <label class="form-label">技能名称</label>
                        <input type="text" class="form-input" id="skillName" value="${escapeHtml(item.name)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">分类</label>
                        <input type="text" class="form-input" id="skillCategory" value="${escapeHtml(item.category)}" placeholder="如：编程、设计、写作等">
                    </div>
                    <div class="form-group">
                        <label class="form-label">学习进度: ${progress}%</label>
                        <input type="range" class="form-range" id="skillProgress" min="0" max="100" value="${progress}" oninput="document.getElementById('skillProgressValue').textContent = this.value + '%'">
                        <div style="text-align: center; font-size: 1.2rem; font-weight: 700; color: #e88a4c;" id="skillProgressValue">${progress}%</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">学习资源</label>
                        <textarea class="text-editor" id="skillResources">${escapeHtml(item.resources)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">学习笔记</label>
                        <textarea class="text-editor" id="skillNotes">${escapeHtml(item.notes)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">上传图片</label>
                        <input type="file" id="skillImageInput" accept="image/*" multiple style="display: none;">
                        <button class="add-btn" style="width: 100%; background: rgba(232, 138, 76, 0.3);" onclick="document.getElementById('skillImageInput').click()">📷 选择图片</button>
                        <div id="skillImagesPreview" style="margin-top: 12px;">
                            ${item.images.map((img, idx) => `<img src="${escapeHtml(img)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" onclick="removeSkillImage(${inlineHandlerArg(id)}, ${idx})">`).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveSkill(${inlineHandlerArg(id)})">💾 保存</button>
                        <button class="add-btn" style="background: rgba(200, 160, 200, 0.3);" onclick="renderSkillsList()">返回列表</button>
                    </div>
                </div>
            `;

            document.getElementById('skillImageInput').addEventListener('change', function(e) {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
                        const item = list.find(i => i.id === id);
                        if (item) {
                            item.images.push(event.target.result);
                            localStorage.setItem('vitaflow_skills', JSON.stringify(list));
                            document.getElementById('skillImagesPreview').innerHTML += `<img src="${escapeHtml(event.target.result)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;">`;
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            });
        }

        function removeSkillImage(itemId, imgIndex) {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const item = list.find(i => i.id === itemId);
            if (item) {
                item.images.splice(imgIndex, 1);
                localStorage.setItem('vitaflow_skills', JSON.stringify(list));
                openSkillDetail(itemId);
            }
        }

        function saveSkill(id) {
            const list = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            const index = list.findIndex(i => i.id === id);
            if (index >= 0) {
                list[index].name = document.getElementById('skillName').value;
                list[index].category = document.getElementById('skillCategory').value;
                list[index].progress = parseInt(document.getElementById('skillProgress').value);
                list[index].resources = document.getElementById('skillResources').value;
                list[index].notes = document.getElementById('skillNotes').value;
                localStorage.setItem('vitaflow_skills', JSON.stringify(list));
                alert('✅ 已保存');
                document.getElementById('ideas-skills').innerHTML = '<div style="margin-bottom: 16px;"><button class="add-btn" style="background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="addSkillItem()">+ 添加学习技能</button></div><div id="skillsList"></div>';
                renderSkillsList();
            }
        }

        let pomodoroInterval = null;
        let pomodoroTimeLeft = 0;
