// Wait until page fully loads
window.addEventListener('DOMContentLoaded', () => {
  const footer = document.createElement('footer');
  footer.className = 'text-center py-3 mt-5 small';
  
  const year = new Date().getFullYear();
  
  footer.innerHTML = `
    <a href="https://github.com/TCFVentures/status-zero" target="_blank" rel="noopener noreferrer">
      Status Zero
    </a> 
    (<a href="https://github.com/TCFVentures/status-zero/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
      CC-BY-4.0
    </a>) | 
    Copyright © ${year} 
    <a href="https://statuszero.org" target="_blank" rel="noopener noreferrer">
      StatusZERO
    </a>
     &
    <a href="https://tcf.ventures" target="_blank" rel="noopener noreferrer">
      TCF VENTURES LLC
    </a>
  `;
  
  document.body.appendChild(footer);
});
