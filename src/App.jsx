import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { Heart, Volume2, VolumeX, Sparkles, Gift, Mail, Copy, Download, Share2, RotateCw, ArrowDown, Sun, X, CheckCircle2, PartyPopper, Flower2, Eye } from 'lucide-react';

const STORAGE_KEY = 'subi-dashain-gift-v1';
const AMOUNT = 1005;
const PRIZES = [51, 101, 151, 251, 501, 751, 901, 1005];
const fmtDate = () => new Intl.DateTimeFormat(undefined, { year:'numeric', month:'long', day:'numeric' }).format(new Date());
const makeId = () => `SUBI-DASH-1005-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const readSaved = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; } };

function App() {
  const saved = useMemo(readSaved, []);
  const [opened, setOpened] = useState(Boolean(saved?.won));
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState(Boolean(saved?.won));
  const [voucherId, setVoucherId] = useState(saved?.voucherId || '');
  const [issueDate, setIssueDate] = useState(saved?.issueDate || fmtDate());
  const [showLetter, setShowLetter] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [showVoucher, setShowVoucher] = useState(Boolean(saved?.won));
  const [showClaim, setShowClaim] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [toast, setToast] = useState('');
  const [wheelRotation, setWheelRotation] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const voucherRef = useRef(null);
  const claimRef = useRef(null);

  const payload = useMemo(() => [
    'A LITTLE GIFT FROM RAMESH',
    'Recipient: Subi',
    'Sender: Ramesh',
    'Amount: NPR 1005',
    `Voucher ID: ${voucherId || 'Pending spin'}`,
    'Occasion: Dashain Tika',
    'Status: Pending confirmation',
    'This is a gift claim reference, not a payment.'
  ].join('\n'), [voucherId]);

  useEffect(() => {
    if (!voucherId) return;
    QRCode.toDataURL(payload, { width: 600, margin: 2, errorCorrectionLevel: 'H', color: { dark:'#351015', light:'#FFF8ED' } })
      .then(setQrDataUrl).catch(() => setToast('QR generation had a problem. Please try again.'));
  }, [payload, voucherId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const persistWin = (id) => {
    const next = { won: true, voucherId: id, issueDate: fmtDate(), amount: AMOUNT, status: 'Awaiting confirmation' };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setVoucherId(id); setIssueDate(next.issueDate); setWon(true); setShowVoucher(true);
  };

  const spin = () => {
    if (spinning || won) { if (won) { setShowVoucher(true); document.getElementById('voucher')?.scrollIntoView({behavior:'smooth'}); } return; }
    setSpinning(true);
    // Segment 7 is the guaranteed grand prize. This is a presentation animation, not a random draw.
    const segmentAngle = 360 / PRIZES.length;
    const targetRotation = 360 * 6 + (360 - (7 * segmentAngle + segmentAngle / 2));
    setWheelRotation(targetRotation);
    window.setTimeout(() => {
      setSpinning(false);
      persistWin(makeId());
      setToast('Grand prize unlocked — Rs 1,005, just for Subi! ❤️');
      document.getElementById('prize')?.scrollIntoView({behavior:'smooth', block:'center'});
    }, 4700);
  };

  const downloadNode = async (ref, filename) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 3, cacheBust: true, backgroundColor: '#351015' });
      const a = document.createElement('a'); a.download = filename; a.href = dataUrl; a.click();
      setToast('Your gift image is ready and downloaded. ❤️');
    } catch (e) {
      console.error(e);
      setToast('Image export could not finish. Please take a normal screenshot instead.');
    }
  };

  const copyText = async (text, success) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(success);
    } catch {
      const area = document.createElement('textarea'); area.value = text; area.style.position='fixed'; area.style.opacity='0';
      document.body.appendChild(area); area.select();
      try { document.execCommand('copy'); setToast(success); } catch { setToast('Copy is unavailable here. Please select and copy the text manually.'); }
      area.remove();
    }
  };

  const share = async () => {
    const message = `Subi's Dashain surprise from Ramesh ❤️ My gift voucher is ${voucherId} for Rs 1,005. Status: awaiting confirmation.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Subi's Dashain Gift", text: message }); setToast('Thanks for sharing your surprise!'); return; } catch (e) { if (e?.name === 'AbortError') return; }
    }
    await downloadNode(voucherRef, 'Subi-Dashain-Voucher.png');
    await copyText(message, 'Voucher downloaded. Personalized message copied to clipboard.');
  };

  const reveal = () => {
    setOpened(true);
    setToast('A little Dashain magic, made just for you. ✨');
  };

  return <div className="app-shell">
    <div className="ambient" aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i} style={{'--i':i}}>{i%3===0?'✦':i%3===1?'•':'❀'}</span>)}</div>
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Subi's Dashain Surprise"><span className="brand-mark"><Heart size={17} fill="currentColor"/></span><span>Subi's Dashain Surprise</span></a>
      <div className="top-actions"><span className="festival-tag"><Sun size={14}/> Dashain Tika</span><button className="icon-btn" onClick={()=>setSoundOn(v=>!v)} aria-label={soundOn?'Turn sound off':'Turn sound on'} title="Sound toggle">{soundOn?<Volume2 size={18}/>:<VolumeX size={18}/>}</button></div>
    </header>

    <main>
      <section id="home" className={`hero ${opened?'hero-open':''}`}>
        <div className="hero-ornament ornament-one">✺</div><div className="hero-ornament ornament-two">✺</div>
        <div className="hero-content">
          <div className="eyebrow"><span/> A FESTIVE SURPRISE, MADE WITH LOVE <span/></div>
          <div className="hero-diya" aria-hidden="true"><span className="diya-flame">✦</span><span className="diya-bowl">◡</span><span className="diya-glow"/></div>
          <p className="nepali">शुभ दशैं, मेरी Subi <span>❤️</span></p>
          <h1>Happy Dashain Tika,<br/><em>my dearest Subi.</em></h1>
          <p className="hero-copy">Yo Dashain timro lagi ajhai special hos. Timro muskan mero lagi sabai bhanda thulo gift ho. Timi sadhai khusi, swastha ra safal rahau. Yo sano surprise chai timro lagi, mero mutu bata.</p>
          <div className="signature">with all my love, Ramesh <Heart size={15} fill="currentColor"/></div>
          {!opened ? <button className="gold-button hero-button" onClick={reveal}><Sparkles size={18}/> Open Your Dashain Surprise <Sparkles size={18}/></button> :
            <a className="gold-button hero-button" href="#greeting"><Heart size={18} fill="currentColor"/> Your surprise is waiting <ArrowDown size={17}/></a>}
          <div className="hero-footnote"><span className="mini-flower">✿</span> A little gift, a lot of love <span className="mini-flower">✿</span></div>
        </div>
        <div className="hero-bottom-pattern" aria-hidden="true"/>
      </section>

      {opened && <div className="content-reveal">
        <section id="greeting" className="section greeting-section">
          <div className="section-kicker"><Flower2 size={16}/> A NOTE JUST FOR YOU</div>
          <div className="greeting-card">
            <div className="card-flower flower-left">✿</div><div className="card-flower flower-right">✿</div>
            <div className="tika-illustration" aria-label="Illustration of Dashain tika, rice grains, and jamara"><div className="plate"><div className="plate-inner"><div className="tika-dot"/><div className="rice rice-a"/><div className="rice rice-b"/><div className="rice rice-c"/><div className="jamara">♧<br/>♧</div><span className="plate-flower">✿</span></div></div></div>
            <p className="script-small">To My Favorite Person,</p><h2>Subi <span>💗</span></h2>
            <p>Dashain ko dherai dherai subhakamana, meri Subi! May this beautiful festival bring you endless happiness, good health, success, peace, and countless reasons to smile. Timi mero lagi ekdam special chau, and I wanted to make this Dashain a little more memorable just for you.</p>
            <div className="signature dark-signature">Made with love, exclusively for Subi — Ramesh.</div>
          </div>
        </section>

        <section className="blessing-strip">
          <div className="strip-icon"><Gift size={27}/></div><div><p className="section-kicker">A DASHain BLESSING</p><h2>Your Dashain Blessing Is Waiting <span>🌺</span></h2><p>Every Dashain brings blessings, love, and a little surprise. Today, your special dakshina is waiting to be revealed!</p></div>
          <a href="#wheel" className="gold-button strip-button">Discover My Dakshina <ArrowDown size={17}/></a>
        </section>

        <section id="wheel" className="section wheel-section">
          <div className="section-kicker"><Sparkles size={16}/> THE MOMENT OF MAGIC</div>
          <h2 className="section-title">A little spin, <em>a lot of love.</em></h2>
          <p className="section-subtitle">One special surprise has been saved just for you, Subi.</p>
          <div className="wheel-layout">
            <div className="wheel-wrap">
              <div className="wheel-pointer" aria-hidden="true">▼</div>
              <div className={`wheel ${spinning?'is-spinning':''}`} style={{transform:`rotate(${wheelRotation}deg)`}}>
                <svg viewBox="0 0 400 400" role="img" aria-label="Lucky wheel with decorative prize amounts; guaranteed grand prize is Rs 1,005">
                  <defs><radialGradient id="wheelGold"><stop offset="0" stopColor="#fff2bf"/><stop offset="1" stopColor="#c39425"/></radialGradient></defs>
                  {PRIZES.map((prize,i)=>{
                    const a0=i*45-90, a1=(i+1)*45-90, p=(a)=>[200+190*Math.cos(a*Math.PI/180),200+190*Math.sin(a*Math.PI/180)];
                    const s=p(a0), e=p(a1), mid=(a0+a1)/2, labelX=200+126*Math.cos(mid*Math.PI/180), labelY=200+126*Math.sin(mid*Math.PI/180);
                    const fills=['#641E24','#D4AF37','#B51F2A','#FFF0CC','#8D1B27','#E9C66E','#351015','#F4E3B1'];
                    return <g key={prize}><path d={`M 200 200 L ${s[0]} ${s[1]} A 190 190 0 0 1 ${e[0]} ${e[1]} Z`} fill={fills[i]} stroke="#f8e6b3" strokeWidth="3"/><text x={labelX} y={labelY} transform={`rotate(${mid+90},${labelX},${labelY})`} textAnchor="middle" dominantBaseline="middle" fontSize={prize===1005?15:17} fontWeight="700" fill={i===1||i===3||i===5||i===7?'#351015':'#fff8ed'}>{prize===1005?'👑 ':''}Rs {prize.toLocaleString('en-US')}</text>{prize===1005&&<text x={labelX} y={labelY+19} transform={`rotate(${mid+90},${labelX},${labelY+19})`} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1" fill="#351015">GRAND PRIZE</text>}</g>
                  })}
                  <circle cx="200" cy="200" r="47" fill="url(#wheelGold)" stroke="#fff0bd" strokeWidth="5"/><circle cx="200" cy="200" r="37" fill="#641E24" stroke="#d4af37" strokeWidth="2"/><text x="200" y="211" textAnchor="middle" fontSize="31" fill="#f9e3a4">♥</text><circle cx="200" cy="200" r="194" fill="none" stroke="#D4AF37" strokeWidth="8"/>
                </svg>
              </div>
              <div className="wheel-shadow"/>
            </div>
            <div className="wheel-copy">
              <div className="wheel-note"><span className="note-icon">✦</span><div><strong>Reserved with love</strong><p>Your special Dashain gift is waiting, no matter where the wheel lands.</p></div></div>
              <div className="prize-amount"><span>YOUR SPECIAL GIFT</span><strong>Rs 1,005</strong><small>👑 GRAND PRIZE · JUST FOR SUBI</small></div>
              <button className="gold-button spin-button" onClick={spin} disabled={spinning}>{spinning?<><RotateCw className="spin-icon" size={19}/> Spinning with love…</>:won?<><CheckCircle2 size={19}/> View My Voucher</>:<>🎡 SPIN FOR MY DASHAIN DAKSHINA 🎡</>}</button>
              <p className="fine-print">Your special Dashain gift has been reserved with love by Ramesh. Other wheel amounts are illustrative demo prizes only. The guaranteed gift is Rs 1,005.</p>
              {won && <button className="text-button" onClick={()=>{setShowVoucher(true);document.getElementById('voucher')?.scrollIntoView({behavior:'smooth'});}}><Eye size={16}/> View My Voucher</button>}
            </div>
          </div>
        </section>

        {won && <section id="prize" className="section prize-section">
          <div className="prize-glow"/>
          <div className="section-kicker"><PartyPopper size={16}/> YOUR SURPRISE IS HERE</div>
          <h2>CONGRATULATIONS, SUBI!</h2><p className="prize-subtitle">YOU HAVE UNLOCKED YOUR SPECIAL DASHAIN DAKSHINA</p>
          <div className="prize-crown">♛</div><div className="grand-amount">NPR Rs 1,005</div><div className="grand-label">👑 GRAND PRIZE UNLOCKED 👑</div>
          <p className="prize-message">Surprise, meri Subi! ❤️<br/>Your Dashain dakshina is Rs 1,005 — specially chosen for you by Ramesh.<br/><br/>Yo paisa bhanda pani timro muskan mero lagi dherai valuable cha. May your Dashain be filled with happiness, blessings, and beautiful memories. Timi sadhai yesari nai hasirahanu. 🌺🪔</p>
          <div className="prize-actions"><button className="gold-button" onClick={()=>{setShowVoucher(true);document.getElementById('voucher')?.scrollIntoView({behavior:'smooth'});}}><Gift size={18}/> Claim My Dakshina</button><button className="outline-button" onClick={()=>setShowLetter(true)}><Mail size={18}/> Read a Special Message</button></div>
        </section>}

        {won && <section id="voucher" className="section voucher-section">
          <div className="section-kicker"><Gift size={16}/> YOUR PERSONAL DASHain GIFT</div>
          <h2 className="section-title">A little gift <em>from Ramesh.</em></h2>
          <p className="section-subtitle">A keepsake made for you, Subi. Save it, treasure it, and show it to Ramesh when claiming your gift.</p>
          <div className="voucher-frame" ref={voucherRef}>
            <div className="voucher-outer-pattern"><span>✺</span><span>✺</span><span>✺</span><span>✺</span></div>
            <div className="voucher-inner">
              <div className="voucher-topline"><span>शुभ दशैं</span><span className="voucher-seal"><Heart size={20} fill="currentColor"/></span><span>2026 · DASHain TIKA</span></div>
              <div className="voucher-decor"><span>🌼</span><span className="jamara-voucher">♧</span><span>🪔</span></div>
              <p className="voucher-eyebrow">A LITTLE GIFT FROM RAMESH</p>
              <h2>Your Dashain<br/><em>Gift Voucher</em></h2>
              <p className="voucher-for">Made especially for <strong>Subi</strong></p>
              <div className="voucher-amount">Rs 1,005</div>
              <div className="voucher-divider"><span>✦</span> WITH LOVE, ALWAYS <span>✦</span></div>
              <p className="voucher-love">For my dearest Subi, a little Dashain surprise made with lots of love. May this Dashain bring you happiness, beautiful memories, and a thousand reasons to smile. You deserve something special, today and always. ❤️</p>
              <div className="voucher-meta"><div><small>GIFT FROM</small><strong>Ramesh ❤️</strong></div><div><small>ISSUED ON</small><strong>{issueDate}</strong></div></div>
              <div className="voucher-id"><small>UNIQUE VOUCHER ID</small><strong>{voucherId}</strong></div>
              <div className="status-pill">🎁 Gift Status: Awaiting Confirmation</div>
              <p className="voucher-terms">Personal Dashain gift voucher. Please confirm the gift details with Ramesh when redeeming. This voucher is not proof of a completed payment.</p>
              <div className="voucher-footer">Made with love, just for you · Ramesh <Heart size={13} fill="currentColor"/></div>
            </div>
          </div>
          <div className="voucher-actions">
            <button className="gold-button" onClick={()=>downloadNode(voucherRef,'Subi-Dashain-Voucher.png')}><Download size={17}/> Download My Voucher</button>
            <button className="outline-button light-outline" onClick={()=>downloadNode(claimRef,'Subi-Dashain-QR-Claim.png')}><Download size={17}/> Download QR Claim Card</button>
            <button className="outline-button light-outline" onClick={()=>copyText(voucherId,'Voucher ID copied! ❤️')}><Copy size={17}/> Copy Voucher ID</button>
            <button className="outline-button light-outline" onClick={()=>downloadNode(voucherRef,'Subi-Dashain-Voucher.png')}><Gift size={17}/> Save My Gift</button>
            <button className="outline-button light-outline" onClick={share}><Share2 size={17}/> Share My Surprise</button>
          </div>
          <p className="success-line">A little gift, a lot of love. Happy Dashain, Subi! ❤️</p>
          <button className="text-button light-text" onClick={()=>setShowHidden(true)}><Heart size={16} fill="currentColor"/> One Last Message from Ramesh 💌</button>
          <div className="claim-card-wrap" ref={claimRef}>
            <div className="claim-card">
              <div className="claim-top"><span>शुभ दशैं</span><span>✦</span><span>DASHAIN GIFT CLAIM</span></div>
              <h3>Subi's Dakshina Claim</h3><p className="claim-amount">Rs 1,005</p>
              {qrDataUrl ? <img className="qr-image" src={qrDataUrl} alt="Scannable QR code for Subi's Rs 1,005 gift voucher claim"/> : <div className="qr-placeholder">Preparing your QR…</div>}
              <strong className="claim-ref">{voucherId}</strong>
              <div className="claim-details"><span>Recipient <b>Subi</b></span><span>Gift from <b>Ramesh</b></span><span>Occasion <b>Dashain Tika</b></span><span>Status <b>Awaiting confirmation</b></span></div>
              <p className="claim-note">Your claim will be confirmed by Ramesh. This QR is a gift-claim reference only; it does not transfer money or verify a payment.</p>
            </div>
          </div>
          <div className="claim-instructions"><h3>How to claim your little surprise</h3><div className="steps"><div><span>01</span><strong>Capture</strong><p>Take a screenshot or download your Rs 1,005 claim QR code.</p></div><div><span>02</span><strong>Send</strong><p>Send the screenshot to Ramesh through your preferred messaging app.</p></div><div><span>03</span><strong>Receive</strong><p>Ramesh will verify your claim and arrange your Dashain dakshina.</p></div></div><p className="cute-caption">One little screenshot, one special surprise, and lots of Dashain love. ❤️</p></div>
        </section>}

        <section className="section envelope-section">
          <div className="envelope-art"><Mail size={45}/><Heart className="envelope-heart" size={21} fill="currentColor"/></div>
          <p className="script-small">A tiny secret, just for you</p><h2>Open when you're ready, Subi 💌</h2><p>There's one more little note tucked away with all my love.</p>
          <button className="outline-button" onClick={()=>setShowHidden(v=>!v)}>{showHidden?'Close your secret note':'Open your secret note'} <Heart size={16}/></button>
          {showHidden && <div className="hidden-note">Psst... Your biggest prize isn't Rs 1,005. It's the smile on your face. ❤️<br/><span>— Ramesh</span></div>}
        </section>

        <section className="final-section">
          <div className="final-mandala">✺</div><p className="section-kicker">UNTIL THE NEXT LITTLE SURPRISE</p><h2>Happy Dashain,<br/><em>My Subi!</em> ❤️🌺</h2><p>May your life always be filled with happiness, love, good health, and beautiful surprises.</p><div className="final-amount">Your special dakshina of <strong>Rs 1,005</strong> is waiting to be claimed.</div><div className="signature">Made with love, just for you.<br/>Ramesh ❤️</div><button className="gold-button" onClick={()=>{setOpened(true);if(won){setShowVoucher(true);document.getElementById('prize')?.scrollIntoView({behavior:'smooth'});}else document.getElementById('wheel')?.scrollIntoView({behavior:'smooth'});}}><Sparkles size={17}/> Celebrate Again</button>
        </section>
      </div>}
    </main>

    <footer className="footer"><span>Made with <Heart size={12} fill="currentColor"/> by Ramesh, for Subi</span><span>शुभ दशैं · शुभकामना</span></footer>

    {showLetter && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLetter(false);}}><div className="letter-modal" role="dialog" aria-modal="true" aria-labelledby="letter-title"><button className="modal-close" onClick={()=>setShowLetter(false)} aria-label="Close letter"><X size={20}/></button><div className="letter-ornament">✺</div><p className="script-small">A letter from the heart</p><h2 id="letter-title">To My Dearest Subi ❤️</h2><p>Dear Subi,</p><p>Dashain is a time for blessings, family, happiness, and new beginnings. This year, I wanted to create something a little different for you — a small surprise made with lots of love.</p><p>You deserve happiness, peace, success, and all the beautiful things life has to offer. I hope this little Dashain dakshina brings a smile to your face and makes you feel as special as you truly are.</p><p>No matter how small or big this gift may be, it comes with my warmest wishes for you.</p><p>May your days be bright, your dreams come true, and your heart always have reasons to smile.</p><p>Happy Dashain Tika, Subi!</p><div className="letter-signature">With lots of love,<br/>Ramesh ❤️</div><button className="gold-button" onClick={()=>setShowLetter(false)}>Keep this close to your heart</button></div></div>}
    {showHidden && <div className="hidden-message-pop" role="status"><button onClick={()=>setShowHidden(false)} aria-label="Close message"><X size={15}/></button><Heart size={21} fill="currentColor"/><p>Subi, this little surprise is just my way of reminding you how special you are to me. No matter how big or small the gift is, the happiness of seeing you smile means much more. Happy Dashain, meri maya.</p><span>— Ramesh ❤️</span></div>}
    {toast && <div className="toast" role="status"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}
export default App;