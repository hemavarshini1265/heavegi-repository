// Heavegi Assistant Widget — Injected on all pages
(function () {
  const SESSION_ID = (() => {
    let sid = sessionStorage.getItem('heavegi_session');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('heavegi_session', sid);
    }
    return sid;
  })();

  let chatInjected = false;
  let popupEl, inputEl, sendBtnEl, messagesEl, fabEl;

  function injectChatWidget() {
    if (chatInjected || document.getElementById('chat-popup')) return;
    chatInjected = true;

    const widgetHTML = `
      <div id="chat-fab" title="Chat with Heavegi Assistant" aria-label="Open chat assistant">
        <span class="chat-fab-icon">💬</span>
        <span class="chat-fab-badge">AI</span>
      </div>
      <div id="chat-popup" role="dialog" aria-label="Heavegi Assistant" aria-hidden="true">
        <div id="chat-header">
          <div class="chat-header-title">
            <span class="chat-avatar">🛍️</span>
            <div>
              <strong>Heavegi AI Assistant</strong>
              <small>Online • 24x7 India Support</small>
            </div>
          </div>
          <button id="chat-close" aria-label="Close chat">✕</button>
        </div>
        <div id="chat-messages" aria-live="polite"></div>
        <div id="chat-input-row">
          <input id="chat-input" type="text" placeholder="Ask about orders, delivery, error codes…" autocomplete="off" />
          <button id="chat-send" aria-label="Send message">Send</button>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = widgetHTML;
    document.body.appendChild(wrapper);

    fabEl = document.getElementById('chat-fab');
    popupEl = document.getElementById('chat-popup');
    const closeBtn = document.getElementById('chat-close');
    inputEl = document.getElementById('chat-input');
    sendBtnEl = document.getElementById('chat-send');
    messagesEl = document.getElementById('chat-messages');

    fabEl.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => {
      popupEl.classList.remove('open');
      popupEl.setAttribute('aria-hidden', 'true');
    });

    sendBtnEl.addEventListener('click', () => sendMessage());
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Initial greeting if empty
    if (messagesEl.children.length === 0) {
      appendBotMessage(
        '🙏 **Namaste! Welcome to Heavegi Platforms.**\nI can answer questions from our FAQs, explain HTTP error codes (like 404, 500, HEAVEGI-001), or automatically create a support ticket if you need extra assistance. How can I help you today?',
        null
      );
    }
  }

  function toggleChat() {
    if (!popupEl) injectChatWidget();
    const isOpen = popupEl.classList.toggle('open');
    popupEl.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      inputEl.focus();
    }
  }

  async function sendMessage(presetText) {
    const text = presetText || inputEl.value.trim();
    if (!text) return;
    if (!presetText) inputEl.value = '';

    appendUserMessage(text);
    const typingEl = appendTyping();

    try {
      const base = window.API_BASE !== undefined ? window.API_BASE : '';
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: SESSION_ID }),
      });

      const data = await res.json();
      typingEl.remove();

      const replyText = data.response || data.reply || data.message || 'I received your request.';
      const replyId = 'reply_' + Date.now();
      appendBotMessage(replyText, replyId, data.ticket_id);
    } catch (err) {
      typingEl.remove();
      appendBotMessage('⚠️ Unable to connect to Heavegi Assistant server. Please check your network or try again.', null);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-user';
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-bot chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function formatMarkdown(text) {
    // Basic Markdown bold and linebreaks
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n\n/g, '<br/><br/>');
    html = html.replace(/\n/g, '<br/>');
    return html;
  }

  function appendBotMessage(text, replyId, ticketId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-bot-wrapper';

    const div = document.createElement('div');
    div.className = 'chat-msg chat-bot';
    div.innerHTML = formatMarkdown(text);
    wrapper.appendChild(div);

    if (ticketId) {
      const ticket = document.createElement('div');
      ticket.className = 'chat-ticket';
      ticket.innerHTML = `🎫 <strong>Support Ticket #${ticketId}</strong> created in SQL database. Our team will contact you.`;
      wrapper.appendChild(ticket);
    }

    if (replyId) {
      const fbRow = document.createElement('div');
      fbRow.className = 'chat-feedback';
      fbRow.innerHTML = `
        <span>Was this answer helpful?</span>
        <button class="fb-btn" data-id="${replyId}" data-val="up" title="Helpful">👍 Yes</button>
        <button class="fb-btn" data-id="${replyId}" data-val="down" title="Not helpful">👎 No</button>
      `;

      fbRow.querySelectorAll('.fb-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          fbRow.querySelectorAll('.fb-btn').forEach((b) => (b.disabled = true));
          fbRow.querySelector('span').textContent = 'Thank you for your feedback! (Logged to MongoDB)';
          const base = window.API_BASE !== undefined ? window.API_BASE : '';
          try {
            await fetch(`${base}/api/feedback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: SESSION_ID,
                reply_id: replyId,
                vote: btn.dataset.val,
                type: 'support',
              }),
            });
          } catch (_) {}
        });
      });
      wrapper.appendChild(fbRow);
    }

    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Global helper for buttons on 404, 500, FAQ, and Error-Codes pages
  window.openAssistant = function (customQuery) {
    if (!popupEl) injectChatWidget();
    popupEl.classList.add('open');
    popupEl.setAttribute('aria-hidden', 'false');
    if (customQuery) {
      sendMessage(customQuery);
    } else {
      inputEl.focus();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatWidget);
  } else {
    injectChatWidget();
  }
})();
