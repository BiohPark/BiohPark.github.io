/*
 * 개발자도구로 우회 가능한 캐주얼 억제다. 예외를 적용하고 나면 실제 선택이 막히는 대상은 제목·eyebrow·초대 문구뿐이며, 보호 가치가 있는 텍스트는 전부 예외 목록에 있다. 실질 보호는 URL 비공개와 민감정보 접기에 있다. 이 파일이 실제보다 강한 보호를 암시해서는 안 된다.
 */
(() => {
  'use strict';

  document.addEventListener('contextmenu', (event) => event.preventDefault());

  const disableImageDragging = () => {
    document.querySelectorAll('img').forEach((image) => {
      image.draggable = false;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', disableImageDragging, { once: true });
  } else {
    disableImageDragging();
  }
})();
