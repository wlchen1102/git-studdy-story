// 主交互逻辑：Mermaid 初始化与步骤事件绑定
(function () {
  // 初始化 Mermaid（全局一次）
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  }

  // 渲染函数：基于给定的 Mermaid 代码，异步渲染到容器
  async function renderGraph(stateKey, states) {
    const container = document.getElementById('git-graph-container');
    if (!container) return;

    const code = states[stateKey];
    if (!code) {
      container.innerHTML = `<div class="text-red-600">未找到状态：${stateKey}</div>`;
      return;
    }

    // 清空容器
    container.innerHTML = '';

    // 为每次渲染生成唯一 ID，避免并发与缓存问题
    const uniqueId = `git-graph-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const graphWrapper = document.createElement('div');
    graphWrapper.className = 'mermaid';
    graphWrapper.id = uniqueId;
    graphWrapper.textContent = code;
    container.appendChild(graphWrapper);

    // 使用 mermaid 的 API 渲染
    try {
      // 方式一：使用 mermaid.render 返回 svg 字符串
      const { svg } = await window.mermaid.render(uniqueId, code);
      container.innerHTML = svg; // 直接将 SVG 插入容器
    } catch (err) {
      console.error('Mermaid 渲染失败:', err);
      container.innerHTML = `<div class="text-red-600">渲染失败：${String(err)}</div>`;
    }
  }

  // 初始化应用：
  // - 绑定左侧步骤点击事件
  // - 默认渲染 initial 状态
  function initializeApp(gitStates) {
    // 委托事件：为 .step 元素绑定点击
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.step');
      if (!target) return;
      const state = target.getAttribute('data-state');
      if (!state) return;

      // 交互效果：高亮当前
      document.querySelectorAll('.step').forEach((el) => el.classList.remove('active'));
      target.classList.add('active');

      // 渲染对应状态
      renderGraph(state, gitStates);
    });

    // 页面加载后渲染初始状态
    window.addEventListener('DOMContentLoaded', () => {
      // 如果页面作者未定义 initial，可降级选择第一个键
      const initialKey = gitStates['initial'] ? 'initial' : Object.keys(gitStates)[0];
      if (initialKey) {
        renderGraph(initialKey, gitStates);
      }
    });
  }

  // 暴露到全局，供各个 lesson 页面调用 initializeApp(gitStates)
  window.initializeApp = initializeApp;
})();