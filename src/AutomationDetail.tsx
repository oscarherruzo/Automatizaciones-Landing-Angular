.overlay {
  position:        fixed;
  inset:           0;
  background:      rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index:         200;
  display:         flex;
  align-items:     center;
  justify-content: center;
  padding:         var(--space-4);
  animation:       fadeIn 150ms ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  width:          100%;
  max-width:      540px;
  background:     var(--color-surface);
  border:         1px solid var(--color-border);
  border-radius:  var(--radius-xl);
  padding:        var(--space-8);
  animation:      slideUp 200ms ease;
  max-height:     90vh;
  overflow-y:     auto;
}

@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.modalHeader {
  display:         flex;
  align-items:     flex-start;
  justify-content: space-between;
  margin-bottom:   var(--space-6);
  gap:             var(--space-4);
}
.modalLabel {
  font-family:    var(--font-mono);
  font-size:      var(--text-xs);
  color:          var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom:  var(--space-1);
}
.modalTitle  { font-size: var(--text-xl); font-weight: 700; letter-spacing: -0.01em; }
.closeBtn    { font-size: var(--text-base); color: var(--color-text-muted); padding: var(--space-1); transition: color var(--transition-fast); flex-shrink: 0; }
.closeBtn:hover { color: var(--color-text); }

.form { display: flex; flex-direction: column; gap: var(--space-4); }
.row  { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
@media (max-width: 480px) { .row { grid-template-columns: 1fr; } }

.priceRow {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
  padding:     var(--space-3) var(--space-4);
  background:  var(--color-surface-2);
  border:      1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.priceLabel { font-size: var(--text-xs); color: var(--color-text-muted); }
.priceValue { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-accent); font-weight: 600; }
.priceDays  { font-size: var(--text-xs); color: var(--color-text-muted); }

.error { font-size: var(--text-sm); color: var(--color-error); }

/* Success */
.success {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  text-align:      center;
  gap:             var(--space-5);
  padding:         var(--space-8) var(--space-4);
}
.successDot {
  width:         16px;
  height:        16px;
  border-radius: 50%;
  background:    var(--color-success);
  box-shadow:    0 0 16px var(--color-success);
}
.successTitle { font-size: var(--text-2xl); font-weight: 700; }
.successText  { font-size: var(--text-sm); color: var(--color-text-muted); max-width: 360px; line-height: 1.7; }
