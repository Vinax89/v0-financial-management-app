'use client'
export default function ThemeSwitch(){
  function toggle(){
    const cur = document.documentElement.getAttribute('data-theme') || 'light'
    const next = cur==='dark'?'light':'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }
  return <button className="px-2 py-1 border rounded" onClick={toggle}>Toggle Theme</button>
}
