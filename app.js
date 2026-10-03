const projectGrid = document.querySelector('#project-grid');
const emptyState = document.querySelector('#empty-state');
const workCount = document.querySelector('#work-count');
const guiSection = document.querySelector('#gui');
const guiGrid = document.querySelector('#gui-grid');
const guiEmptyState = document.querySelector('#gui-empty-state');
const guiCount = document.querySelector('#gui-count');
const heroImage = document.querySelector('#hero-image');
const mediaDialog = document.querySelector('#media-dialog');
const dialogContent = document.querySelector('#dialog-content');
const dialogCaption = document.querySelector('#dialog-caption');
const contactAction = document.querySelector('#contact-action');

function makeProjectCard(project, index) {
  const article = document.createElement('article');
  article.className = 'project-card';
  article.dataset.type = project.type;

  const media = document.createElement('div');
  media.className = 'project-media';

  if (project.type === 'image') {
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'image-preview';
    preview.setAttribute('aria-label', `View ${project.title} full size`);

    const image = document.createElement('img');
    image.src = project.path;
    image.alt = project.title;
    image.loading = 'lazy';
    preview.append(image);
    preview.addEventListener('click', () => openPreview(project));
    media.append(preview);
  } else {
    const video = document.createElement('video');
    video.src = project.path;
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.setAttribute('aria-label', project.title);
    media.append(video);

    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.className = 'preview-button';
    previewButton.setAttribute('aria-label', `View ${project.title} full size`);
    previewButton.innerHTML = '<span aria-hidden="true">⤢</span>';
    previewButton.addEventListener('click', () => openPreview(project));
    media.append(previewButton);
  }

  const info = document.createElement('div');
  info.className = 'project-info';

  const text = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'project-title';
  title.textContent = project.title;

  const kind = document.createElement('span');
  kind.className = 'project-kind';
  kind.textContent = project.type === 'video' ? 'PROCESS FILM' : 'ENVIRONMENT BUILD';

  text.append(title, kind);

  if (project.description) {
    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = project.description;
    text.append(description);
  }

  const number = document.createElement('span');
  number.className = 'project-number';
  number.textContent = String(index + 1).padStart(2, '0');
  info.append(text, number);

  article.append(media, info);
  return article;
}

function openPreview(project) {
  dialogContent.replaceChildren();
  dialogCaption.textContent = project.title;

  const preview = document.createElement(project.type === 'video' ? 'video' : 'img');
  preview.src = project.path;

  if (project.type === 'video') {
    preview.controls = true;
    preview.autoplay = true;
    preview.playsInline = true;
  } else {
    preview.alt = project.title;
  }

  dialogContent.append(preview);
  mediaDialog.showModal();
}

function makeSafeLink(label, url, className) {
  if (!url) return null;

  if (!/^(https:\/\/|mailto:)/i.test(url)) return null;

  const link = document.createElement('a');
  link.className = className;
  link.href = url;
  link.textContent = label;

  if (url.startsWith('https://')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  return link;
}

function makeSocialLink(social) {
  const link = makeSafeLink(`${social.label} ↗`, social.url, 'social-link');

  if (!link || social.icon !== 'discord') return link;

  link.classList.add('discord-link');

  const icon = document.createElement('img');
  icon.src = 'discord-logo.png';
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = social.label;

  const arrow = document.createElement('span');
  arrow.className = 'discord-arrow';
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');

  link.replaceChildren(icon, label, arrow);
  return link;
}

async function loadPortfolio() {
  const [mediaResponse, configResponse] = await Promise.all([
    fetch('media-index.json'),
    fetch('site-config.json')
  ]);

  if (!mediaResponse.ok || !configResponse.ok) {
    throw new Error('Portfolio data was not found. Run the media index generator first.');
  }

  const [mediaIndex, config] = await Promise.all([
    mediaResponse.json(),
    configResponse.json()
  ]);
  const projects = mediaIndex.projects || [];
  const gui = mediaIndex.gui || [];
  const images = projects.filter(project => project.type === 'image');
  guiSection.hidden = gui.length === 0;

  document.querySelector('#header-username').textContent = config.name;
  document.querySelector('.about-copy > p').textContent = config.bio;

  if (images.length) {
    heroImage.src = images[0].path;
    heroImage.hidden = false;
  }

  projectGrid.replaceChildren(...projects.map(makeProjectCard));
  workCount.textContent = `${String(projects.length).padStart(2, '0')} PROJECT${projects.length === 1 ? '' : 'S'}`;
  emptyState.hidden = projects.length > 0;
  guiGrid.replaceChildren(...gui.map(makeProjectCard));
  guiCount.textContent = `${String(gui.length).padStart(2, '0')} INTERFACE PROJECT${gui.length === 1 ? '' : 'S'}`;
  guiEmptyState.hidden = gui.length > 0;

  document.title = `${config.name} | Roblox Environment Design`;
  document.querySelector('meta[name="description"]').content = config.description;

  const emailLink = makeSafeLink('PROJECT INQUIRY ↗', config.email ? `mailto:${config.email}` : '', 'contact-link');
  const socials = (config.socials || [])
    .map(makeSocialLink)
    .filter(Boolean);
  contactAction.replaceChildren(...[emailLink, ...socials].filter(Boolean));
}

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    document.querySelectorAll('.filter-button').forEach(filterButton => {
      const selected = filterButton === button;
      filterButton.classList.toggle('is-active', selected);
      filterButton.setAttribute('aria-pressed', String(selected));
    });

    let visible = 0;
    projectGrid.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.type === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    emptyState.hidden = visible > 0;
  });
});

document.querySelector('#dialog-close').addEventListener('click', () => mediaDialog.close());
mediaDialog.addEventListener('click', event => {
  if (event.target === mediaDialog) mediaDialog.close();
});
mediaDialog.addEventListener('close', () => {
  const video = dialogContent.querySelector('video');
  if (video) video.pause();
});

loadPortfolio().catch(error => {
  workCount.textContent = 'PROJECTS UNAVAILABLE';
  const notice = document.createElement('p');
  notice.className = 'js-notice';
  notice.textContent = 'The project gallery is temporarily unavailable. Please check back shortly.';
  document.querySelector('.work-section').append(notice);
  console.error(error);
});