document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const siteNavigation = document.getElementById('site-navigation');

if (menuToggle && siteNavigation) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.dataset.menuOpen = String(isOpen);
  };

  setMenuOpen(false);

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNavigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', () => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

const inquiryForm = document.getElementById('inquiry-form');
const copyInquiry = document.getElementById('copy-inquiry');
const inquiryDraft = document.getElementById('inquiry-draft');
const draftPanel = document.getElementById('draft-panel');
const inquiryStatus = document.getElementById('inquiry-status');

if (inquiryForm && copyInquiry && inquiryDraft && draftPanel && inquiryStatus) {
  const title = '타입웍스 제작 상담';
  const fields = [
    ['name', '이름'],
    ['organization', '소속'],
    ['email', '이메일'],
    ['problem', '현재 상황과 불편'],
    ['outcome', '원하는 결과'],
    ['budget', '예산'],
    ['timing', '희망 일정'],
  ];

  const prepareDraft = () => {
    const data = new FormData(inquiryForm);
    inquiryDraft.value = `${title}\n\n${fields.map(([name, label]) => {
      const field = inquiryForm.elements.namedItem(name);
      const value = field?.tagName === 'SELECT'
        ? field.selectedOptions[0]?.textContent.trim()
        : String(data.get(name) ?? '').trim();
      return `${label}: ${value || '미정'}`;
    }).join('\n\n')}`;
    draftPanel.hidden = false;
    return inquiryDraft.value;
  };

  copyInquiry.addEventListener('click', async () => {
    if (!inquiryForm.reportValidity()) return;
    const draft = prepareDraft();
    try {
      await navigator.clipboard.writeText(draft);
      inquiryStatus.textContent = '상담 내용을 복사했습니다. 연락 채널에 붙여넣어 전달해 주세요.';
    } catch {
      inquiryDraft.focus();
      inquiryDraft.select();
      inquiryStatus.textContent = '자동 복사를 사용할 수 없습니다. 선택된 내용을 직접 복사해 주세요.';
    }
  });

  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const draft = prepareDraft();
    const recipient = inquiryForm.dataset.recipient?.trim();
    if (!recipient) {
      inquiryStatus.textContent = '상담 내용을 복사해 아래 연락 채널로 전달해 주세요.';
      return;
    }
    inquiryStatus.textContent = '이메일 앱에서 내용을 확인하고 전송해 주세요. 앱이 열리지 않으면 상담 내용을 복사해 주세요.';
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(draft)}`;
  });
}
