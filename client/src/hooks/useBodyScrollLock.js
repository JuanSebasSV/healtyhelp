import { useEffect } from 'react';

const lockStack = [];
let savedOverflow = '';
let savedPaddingRight = '';
let savedBodyTop = '';
let scrollY = 0;

const applyLock = () => {
  if (typeof document === 'undefined') return;
  const win = window;
  const body = document.body;
  const html = document.documentElement;
  const scrollBarWidth = win.innerWidth - html.clientWidth;
  savedOverflow = body.style.overflow;
  savedPaddingRight = body.style.paddingRight;
  savedBodyTop = body.style.top;
  scrollY = win.scrollY;
  body.style.overflow = 'hidden';
  if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`;
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
};

const releaseLock = () => {
  if (typeof document === 'undefined') return;
  const body = document.body;
  body.style.overflow = savedOverflow;
  body.style.paddingRight = savedPaddingRight;
  body.style.position = '';
  body.style.top = savedBodyTop;
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  window.scrollTo(0, scrollY);
};

const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    lockStack.push(1);
    if (lockStack.length === 1) applyLock();
    return () => {
      const idx = lockStack.lastIndexOf(1);
      if (idx !== -1) lockStack.splice(idx, 1);
      if (lockStack.length === 0) releaseLock();
    };
  }, [locked]);
};

export default useBodyScrollLock;
