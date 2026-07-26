---
layout: page
title: Playground
permalink: /pages/playground/
---

# Playground

이것저것 실험하는 공간입니다.

## 새 페이지 추가하는 법

**① Markdown 페이지** (블로그 테마를 그대로 쓰는 경우)

`pages/` 아래에 `.md` 파일을 만들고 맨 위에 front matter를 넣습니다.

```markdown
---
layout: page
title: 페이지 제목
permalink: /pages/주소/
---

내용을 여기에 씁니다.
```

**② 독립 HTML 페이지** (자체 CSS·JS를 쓰는 경우)

루트에 폴더를 만들고 `index.html`을 넣되, **front matter를 넣지 않습니다.**
front matter가 없으면 Jekyll이 가공하지 않고 파일을 그대로 복사합니다.

```
myproject/
  index.html      ← front matter 없음
  style.css
  script.js
```

`https://biohpark.github.io/myproject/` 로 열립니다.

**③ 홈에 카드 추가**

`index.md`의 `.project-grid` 안에 `<a class="project-card">` 블록을 하나 더 넣으면 됩니다.

## 로컬에서 미리 보기

```bash
bundle exec jekyll serve
```

Ruby·Jekyll 설치가 번거로우면, 독립 HTML 페이지는 아무 정적 서버로도 확인할 수 있습니다.

```bash
python -m http.server 4000
```
