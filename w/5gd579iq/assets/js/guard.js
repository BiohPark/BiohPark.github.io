/*
 * 개발자도구로 우회 가능한 캐주얼 억제다. 예외를 적용하고 나면 실제 선택이 막히는 대상은 제목·eyebrow·초대 문구뿐이며, 보호 가치가 있는 텍스트는 전부 예외 목록에 있다. 실질 보호는 URL 비공개와 민감정보 접기에 있다. iOS 접근성 설정의 강제 확대는 막을 수 없다. 이 파일이 실제보다 강한 보호를 암시해서는 안 된다.
 *
 * 7차 실측 정정: 안드로이드 크롬은 롱프레스 이미지 메뉴를 이 contextmenu 취소로 막아 주지 않는다.
 * 실기기에서 히어로만 무반응이었던 이유는 .hero-overlay(inset:0)가 히트 타깃을 가로채기 때문이고,
 * 실제로 듣는 유일한 수단이 그 히트 타깃 차폐다(.photo-frame--guarded). 이 파일은 데스크톱 우클릭과
 * 드래그만 억제한다. 사진 URL 직접 접근과 스크린샷은 어느 쪽으로도 막지 못한다.
 *
 * [data-allow-save] 안의 이미지는 억제 대상이 아니다 — 약도·셔틀 승차장 안내는 하객이 열어서
 * 확대해 봐야 하는 정보이고, 저장을 막을 이유가 없다.
 */
(() => {
  'use strict';

  const isSaveable = (node) => Boolean(node?.closest?.('[data-allow-save]'));

  document.addEventListener('contextmenu', (event) => {
    if (isSaveable(event.target)) return;
    event.preventDefault();
  });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((eventName) => {
    document.addEventListener(eventName, (event) => event.preventDefault(), { passive: false });
  });

  const disableImageDragging = () => {
    document.querySelectorAll('img').forEach((image) => {
      if (isSaveable(image)) return;
      image.draggable = false;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', disableImageDragging, { once: true });
  } else {
    disableImageDragging();
  }
})();
