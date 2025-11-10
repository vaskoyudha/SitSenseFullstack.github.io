// =================================================================
// 1. KONFIGURASI DAN INISIALISASI FIREBASE (seperti test connection)
// =================================================================
// Firebase sudah diinisialisasi di index.html, gunakan yang sudah ada
const auth = window.firebaseAuth || firebase.auth();
const db = window.firebaseDb || firebase.database();

// Variables global untuk referensi
let liveRef = null;
let infoRef = null;

document.addEventListener('DOMContentLoaded', async () => {
  // =================================================================
  // 2. REFERENSI ELEMEN DOM
  // =================================================================
  const $ = (s) => document.querySelector(s);
  const postureScoreEl = $('#postureScore'), postureLabelEl = $('#postureLabel'), postureScoreBarEl = $('#postureScoreBar');
  const backScoreEl = $('#backScore'), neckScoreEl = $('#neckScore'), pressureScoreEl = $('#pressureScore');
  const backScoreBarEl = $('#backScoreBar'), neckScoreBarEl = $('#neckScoreBar'), pressureScoreBarEl = $('#pressureScoreBar');
  const avgScoreEl = $('#avgScore'), totalTimeEl = $('#totalTime'), goodPostureCountEl = $('#goodPostureCount'), badPostureCountEl = $('#badPostureCount');
  const recommendationsEl = $('#recommendations'), historyListEl = $('#historyList');
  const sitDurationEl = $('#sitDuration');
  const deviceIPEl = $('#deviceIP'), deviceFWEl = $('#deviceFW'), deviceStatusEl = $('#deviceStatus');

  // =================================================================
  // INISIALISASI POSTURE VISUAL (heatmap)
  // =================================================================
  // Tunggu sedikit agar canvas sudah tersedia (terutama jika dimuat dari komponen)
  setTimeout(() => {
    if (window.initPostureVisual) {
      try {
        window.initPostureVisual({ canvasId: 'heatmapCanvas' });
        console.log('[SitSense] Posture visual initialized');
      } catch (e) {
        console.error('[SitSense] Failed to initialize posture visual:', e);
      }
    } else {
      console.warn('[SitSense] initPostureVisual function not available');
    }
  }, 500);

  // =================================================================
  // LISTENER UNTUK PANEL-PARAMETERS LOADED
  // =================================================================
  // Simpan nilai balance terakhir untuk di-update ulang setelah panel-parameters dimuat
  let lastBalanceData = null;
  
  // Listen untuk event panel-parameters-loaded
  window.addEventListener('panel-parameters-loaded', () => {
    console.log('[SitSense] Panel parameters loaded, updating balance UI...');
    // Tunggu sedikit untuk memastikan DOM sudah siap
    setTimeout(() => {
      // Update ulang balance jika ada data terakhir
      if (lastBalanceData) {
        console.log('[SitSense] Re-updating balance with last data:', lastBalanceData);
        if (typeof updateBalanceUI === 'function') {
          updateBalanceUI(lastBalanceData.fsrPct, lastBalanceData.backDist, lastBalanceData.neckDist);
        } else if (window.updateBalanceUI) {
          window.updateBalanceUI(lastBalanceData.fsrPct, lastBalanceData.backDist, lastBalanceData.neckDist);
        }
        console.log('[SitSense] Balance UI re-updated after panel-parameters loaded');
      } else {
        console.log('[SitSense] No balance data to update yet');
      }
    }, 100);
  });

  // =================================================================
  // INTERVAL CHECK & MUTATION OBSERVER UNTUK MEMASTIKAN UPDATE
  // =================================================================
  // Interval check untuk memastikan semua elemen ter-update setiap 2 detik
  let balanceCheckInterval = null;
  
  function startBalanceCheckInterval() {
    // Hapus interval lama jika ada
    if (balanceCheckInterval) {
      clearInterval(balanceCheckInterval);
    }
    
    // Jalankan interval check setiap 2 detik
    balanceCheckInterval = setInterval(() => {
      if (lastBalanceData) {
        // Cek apakah semua elemen sudah ter-update dengan benar
        const lrValElements = document.querySelectorAll('#balanceLRVal');
        const fbValElements = document.querySelectorAll('#balanceFBVal');
        const lrFillElements = document.querySelectorAll('#balanceLRFill');
        const fbFillElements = document.querySelectorAll('#balanceFBFill');
        
        let needsUpdate = false;
        
        // Cek apakah ada elemen yang masih menunjukkan nilai lama (50%)
        lrValElements.forEach(el => {
          const currentText = el.textContent.trim();
          const expectedText = Math.round(lastBalanceData.fsrPct) + '%';
          if (currentText === '50%' || currentText === '0%' && lastBalanceData.fsrPct > 0) {
            needsUpdate = true;
            console.log('[SitSense] Detected stale FSR value:', currentText, 'Expected:', expectedText);
          }
        });
        
        fbValElements.forEach(el => {
          const currentText = el.textContent.trim();
          const expectedValue = Math.round(
            calculateNeckBackBalance(lastBalanceData.backDist, lastBalanceData.neckDist)
          ) + '%';
          if (currentText === '50%' || currentText === '0%' && (lastBalanceData.backDist > 0 || lastBalanceData.neckDist > 0)) {
            needsUpdate = true;
            console.log('[SitSense] Detected stale FB value:', currentText, 'Expected:', expectedValue);
          }
        });
        
        // Jika ada elemen yang perlu update, panggil updateBalanceUI lagi
        if (needsUpdate && (lrValElements.length > 0 || fbValElements.length > 0)) {
          console.log('[SitSense] Force updating balance UI due to stale values...');
          if (typeof updateBalanceUI === 'function') {
            updateBalanceUI(lastBalanceData.fsrPct, lastBalanceData.backDist, lastBalanceData.neckDist);
          } else if (window.updateBalanceUI) {
            window.updateBalanceUI(lastBalanceData.fsrPct, lastBalanceData.backDist, lastBalanceData.neckDist);
          }
        }
        
        // Jika elemen belum ditemukan, tunggu dan coba lagi
        if (lrValElements.length < 2 || fbValElements.length < 2) {
          console.log('[SitSense] Waiting for all balance elements to load... (Found:', 
                      lrValElements.length, 'FSR,', fbValElements.length, 'FB)');
        }
      }
    }, 2000); // Check setiap 2 detik
  }
  
  // Helper function untuk menghitung neck-back balance (dari logika updateBalanceUI)
  function calculateNeckBackBalance(backDist, neckDist) {
    if (!backDist || !neckDist || backDist <= 0 || neckDist <= 0 || 
        backDist === -1 || neckDist === -1 || !isFinite(backDist) || !isFinite(neckDist)) {
      return 0;
    }
    
    let backScore = 0;
    if (backDist >= 20 && backDist <= 35) {
      backScore = 100;
    } else if (backDist >= 15 && backDist < 20) {
      backScore = 80 + ((backDist - 15) / 5) * 20;
    } else if (backDist > 35 && backDist <= 50) {
      backScore = Math.max(0, 100 - ((backDist - 35) * 5));
    } else if (backDist < 15 && backDist >= 10) {
      backScore = 60 + ((backDist - 10) / 5) * 20;
    } else if (backDist > 0 && backDist < 10) {
      backScore = Math.max(0, (backDist / 10) * 60);
    }
    
    let neckScore = 0;
    if (neckDist >= 25 && neckDist <= 35) {
      neckScore = 100;
    } else if (neckDist >= 20 && neckDist < 25) {
      neckScore = 70 + ((neckDist - 20) / 5) * 30;
    } else if (neckDist > 35 && neckDist <= 50) {
      neckScore = Math.max(0, 100 - ((neckDist - 35) * 3));
    } else if (neckDist < 20 && neckDist >= 15) {
      neckScore = 50 + ((neckDist - 15) / 5) * 20;
    } else if (neckDist > 0 && neckDist < 15) {
      neckScore = Math.max(0, (neckDist / 15) * 50);
    }
    
    const diff = Math.abs(neckDist - backDist);
    let balanceBonus = 0;
    if (diff <= 5) {
      balanceBonus = 20;
    } else if (diff <= 10) {
      balanceBonus = 10;
    } else if (diff <= 15) {
      balanceBonus = 5;
    }
    
    return Math.min(100, Math.max(0, Math.round((backScore + neckScore) / 2 + balanceBonus)));
  }
  
  // MutationObserver untuk mendeteksi ketika elemen baru ditambahkan ke DOM
  const balanceObserver = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Cek apakah node yang ditambahkan mengandung elemen balance
          if (node.id === 'balanceLRVal' || node.id === 'balanceFBVal' || 
              node.id === 'balanceLRFill' || node.id === 'balanceFBFill' ||
              node.querySelector && (node.querySelector('#balanceLRVal') || node.querySelector('#balanceFBVal') ||
              node.querySelector('#balanceLRFill') || node.querySelector('#balanceFBFill'))) {
            shouldUpdate = true;
          }
        }
      });
    });
    
    if (shouldUpdate && lastBalanceData) {
      console.log('[SitSense] New balance elements detected, updating...');
      setTimeout(() => {
        if (typeof updateBalanceUI === 'function') {
          updateBalanceUI(lastBalanceData.fsrPct, lastBalanceData.backDist, lastBalanceData.neckDist);
        } else if (window.updateBalanceUI) {
          window.updateBalanceUI(lastBalanceData.fsrPct, lastBalanceData.backDist, lastBalanceData.neckDist);
        }
      }, 50);
    }
  });
  
  // Mulai observe perubahan DOM setelah DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    // Observe perubahan di document body
    balanceObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Mulai interval check setelah 3 detik (memberi waktu untuk DOM dimuat)
    setTimeout(() => {
      startBalanceCheckInterval();
      console.log('[SitSense] Balance check interval started');
    }, 3000);
  });

  // =================================================================
  // 3. STATE MANAGEMENT
  // =================================================================
  let timerStart = null, timerInterval = null;
  let sessionData = { scores: [], startTime: Date.now(), goodCount: 0, badCount: 0, sessions: [] };

  // =================================================================
  // 4. FUNGSI UTILITAS & PEMBARUAN UI DASAR
  // =================================================================
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDur = (sec) => {
    sec = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(sec / 3600); sec %= 3600;
    const m = Math.floor(sec / 60); const s = sec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  function setText(el, val) { 
    if (el) {
      el.textContent = val;
    }
  }
  function setStatusWifi(text, ok) { const el = $('#wifiStatus'); if (!el) return; el.innerHTML = `<i data-lucide="wifi" class="h-3.5 w-3.5"></i> ${text}`; if (window.lucide) window.lucide.createIcons(); }
  function setStatusAuth(text) { const el = $('#authStatus'); if (!el) return; el.innerHTML = `<i data-lucide="user" class="h-3.5 w-3.5"></i> ${text}`; if (window.lucide) window.lucide.createIcons(); }
  function setDeviceMeta({ ip, fw, status }) { setText(deviceIPEl, ip || '—'); setText(deviceFWEl, fw || '—'); setText(deviceStatusEl, status || '—'); }

  // =================================================================
  // 5. FUNGSI PEMBARUAN UNTUK SEMUA KOMPONEN UI
  // =================================================================

  // --- Komponen Asli ---
  function updateBalanceUI(fsrPct, backDist, neckDist) {
    // Balance 1: Distribusi Tekanan (FSR) - menunjukkan intensitas tekanan
    // Jika FSR 0, gunakan indikator berdasarkan konsistensi data ultrasonic
    let fsrBalance = Math.min(100, Math.max(0, fsrPct));
    
    // Jika FSR 0, tapi ada data ultrasonic yang konsisten, beri indikator minimal
    if (fsrBalance === 0 && backDist > 0 && neckDist > 0) {
      fsrBalance = 5; // Minimal indicator bahwa sistem aktif
    }
    
    // Balance 2: Keseimbangan Leher ↔ Punggung - menunjukkan keselarasan postur
    // Disesuaikan dengan range yang lebih realistis berdasarkan data aktual
    let neckBackBalance = 0;
    if (backDist !== null && neckDist !== null && backDist > 0 && neckDist > 0 && 
        backDist !== -1 && neckDist !== -1 && isFinite(backDist) && isFinite(neckDist)) {
      
      // Range ideal disesuaikan berdasarkan data aktual:
      // Back: 20-35cm (lebih fleksibel dari 5-15cm karena data menunjukkan ~26-31cm)
      // Neck: 25-35cm (lebih fleksibel dari 30-45cm karena data menunjukkan ~26-27cm)
      
      let backScore = 0;
      if (backDist >= 20 && backDist <= 35) {
        backScore = 100; // Ideal range yang disesuaikan
      } else if (backDist >= 15 && backDist < 20) {
        backScore = 80 + ((backDist - 15) / 5) * 20; // Transisi ke ideal
      } else if (backDist > 35 && backDist <= 50) {
        backScore = Math.max(0, 100 - ((backDist - 35) * 5)); // Terlalu jauh
      } else if (backDist < 15 && backDist >= 10) {
        backScore = 60 + ((backDist - 10) / 5) * 20; // Sedang mendekati ideal
      } else if (backDist > 0 && backDist < 10) {
        backScore = Math.max(0, (backDist / 10) * 60); // Terlalu dekat
      }
      
      let neckScore = 0;
      if (neckDist >= 25 && neckDist <= 35) {
        neckScore = 100; // Ideal range yang disesuaikan
      } else if (neckDist >= 20 && neckDist < 25) {
        neckScore = 70 + ((neckDist - 20) / 5) * 30; // Transisi ke ideal
      } else if (neckDist > 35 && neckDist <= 50) {
        neckScore = Math.max(0, 100 - ((neckDist - 35) * 3)); // Terlalu jauh
      } else if (neckDist < 20 && neckDist >= 15) {
        neckScore = 50 + ((neckDist - 15) / 5) * 20; // Sedang mendekati ideal
      } else if (neckDist > 0 && neckDist < 15) {
        neckScore = Math.max(0, (neckDist / 15) * 50); // Terlalu dekat
      }
      
      // Hitung keseimbangan relatif: seberapa baik perbedaan antara neck dan back
      // Jika perbedaannya kecil (mirip), berarti postur lebih seimbang
      const diff = Math.abs(neckDist - backDist);
      let balanceBonus = 0;
      if (diff <= 5) {
        balanceBonus = 20; // Sangat seimbang (perbedaan < 5cm)
      } else if (diff <= 10) {
        balanceBonus = 10; // Cukup seimbang (perbedaan 5-10cm)
      } else if (diff <= 15) {
        balanceBonus = 5; // Sedang (perbedaan 10-15cm)
      }
      
      // Rata-rata score dengan bonus keseimbangan
      neckBackBalance = Math.round((backScore + neckScore) / 2 + balanceBonus);
      neckBackBalance = Math.min(100, Math.max(0, neckBackBalance));
    }
    
    // Update semua elemen balance (bisa ada beberapa karena duplikasi di index.html dan panel-parameters.html)
    // Gunakan querySelectorAll untuk menemukan semua elemen dengan ID yang sama
    const updateBalanceElements = () => {
      const lrFillElements = document.querySelectorAll('#balanceLRFill');
      const fbFillElements = document.querySelectorAll('#balanceFBFill');
      const lrValElements = document.querySelectorAll('#balanceLRVal');
      const fbValElements = document.querySelectorAll('#balanceFBVal');
      
      // Update FSR balance (Distribusi Tekanan)
      lrFillElements.forEach((el, index) => {
        if (el) {
          // Update width dengan !important untuk override CSS apapun
          el.style.setProperty('width', fsrBalance + '%', 'important');
          el.style.width = fsrBalance + '%';
          
          // Set gradient berdasarkan nilai balance
          let gradient = '';
          if (fsrBalance === 0) {
            // Tidak ada data - abu-abu
            gradient = 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)';
            el.style.setProperty('box-shadow', 'none', 'important');
          } else if (fsrBalance > 0 && fsrBalance < 10) {
            // Data minimal - abu-abu dengan sedikit cyan
            gradient = 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #64748b 100%)';
            el.style.setProperty('box-shadow', '0 0 5px rgba(148, 163, 184, 0.3)', 'important');
          } else if (fsrBalance >= 10 && fsrBalance < 50) {
            // Sedang - cyan gradient
            gradient = 'linear-gradient(90deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)';
            el.style.setProperty('box-shadow', '0 0 10px rgba(34, 211, 238, 0.4)', 'important');
          } else if (fsrBalance >= 50 && fsrBalance < 80) {
            // Baik - cyan to blue gradient
            gradient = 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #22d3ee 100%)';
            el.style.setProperty('box-shadow', '0 0 12px rgba(34, 211, 238, 0.5)', 'important');
          } else {
            // Sangat baik - vibrant cyan-blue gradient
            gradient = 'linear-gradient(90deg, #2563eb 0%, #3b82f6 30%, #06b6d4 70%, #22d3ee 100%)';
            el.style.setProperty('box-shadow', '0 0 15px rgba(34, 211, 238, 0.6)', 'important');
          }
          
          el.style.setProperty('background', gradient, 'important');
          el.style.setProperty('background-image', gradient, 'important');
          
          // Verifikasi update berhasil
          const computedWidth = window.getComputedStyle(el).width;
          const expectedWidth = fsrBalance + '%';
          
          // Debug: log update untuk elemen pertama dan kedua
          if (index < 2 && (!window._lastBalanceLog || Date.now() - window._lastBalanceLog > 2000)) {
            console.log(`[SitSense] Updated FSR element ${index + 1} to ${fsrBalance}% (computed: ${computedWidth})`);
          }
        }
      });
      
      lrValElements.forEach((el, index) => {
        if (el) {
          const newValue = Math.round(fsrBalance) + '%';
          // Force update dengan multiple methods untuk memastikan
          el.textContent = newValue;
          el.innerHTML = newValue;
          el.innerText = newValue;
          // Set attribute juga untuk memastikan
          if (el.firstChild) {
            el.firstChild.textContent = newValue;
          }
          
          // Debug log dengan verifikasi
          if (index < 2 && (!window._lastBalanceLog || Date.now() - window._lastBalanceLog > 2000)) {
            const actualValue = el.textContent.trim();
            console.log(`[SitSense] Updated FSR value element ${index + 1} to ${newValue} (actual: ${actualValue})`);
            if (actualValue !== newValue) {
              console.warn(`[SitSense] Value mismatch! Expected ${newValue}, got ${actualValue}`);
            }
          }
        } else {
          console.warn(`[SitSense] FSR value element ${index} not found`);
        }
      });
      
      // Jika tidak ada elemen yang ditemukan, coba lagi dengan selector yang lebih spesifik
      if (lrValElements.length === 0) {
        console.warn('[SitSense] No FSR value elements found, trying alternative selector...');
        const altElements = document.querySelectorAll('span#balanceLRVal, #balanceLRVal');
        altElements.forEach(el => {
          if (el) {
            const newValue = Math.round(fsrBalance) + '%';
            el.textContent = newValue;
            el.innerHTML = newValue;
            el.innerText = newValue;
            if (el.firstChild) {
              el.firstChild.textContent = newValue;
            }
            console.log('[SitSense] Updated FSR value via alternative selector to', newValue);
          }
        });
      }
      
      // Update Neck-Back balance (Keseimbangan Leher ↔ Punggung)
      fbFillElements.forEach((el, index) => {
        if (el) {
          // Update width dengan !important untuk override CSS apapun
          el.style.setProperty('width', neckBackBalance + '%', 'important');
          el.style.width = neckBackBalance + '%';
          
          // Set gradient berdasarkan nilai balance
          let gradient = '';
          if (neckBackBalance === 0) {
            // Tidak ada data - abu-abu
            gradient = 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)';
            el.style.setProperty('box-shadow', 'none', 'important');
          } else if (neckBackBalance > 0 && neckBackBalance < 60) {
            // Buruk - merah gradient
            gradient = 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%)';
            el.style.setProperty('box-shadow', '0 0 8px rgba(248, 113, 113, 0.4)', 'important');
          } else if (neckBackBalance >= 60 && neckBackBalance < 80) {
            // Sedang - kuning/orange gradient
            gradient = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)';
            el.style.setProperty('box-shadow', '0 0 10px rgba(251, 191, 36, 0.4)', 'important');
          } else if (neckBackBalance >= 80 && neckBackBalance < 95) {
            // Baik - hijau gradient
            gradient = 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)';
            el.style.setProperty('box-shadow', '0 0 12px rgba(52, 211, 153, 0.5)', 'important');
          } else {
            // Sangat baik - vibrant green gradient
            gradient = 'linear-gradient(90deg, #047857 0%, #059669 30%, #10b981 70%, #34d399 100%)';
            el.style.setProperty('box-shadow', '0 0 15px rgba(52, 211, 153, 0.6)', 'important');
          }
          
          el.style.setProperty('background', gradient, 'important');
          el.style.setProperty('background-image', gradient, 'important');
          
          // Verifikasi update berhasil - hitung expected width dalam pixel
          const computedWidth = window.getComputedStyle(el).width;
          const actualWidth = parseFloat(computedWidth);
          const parentWidth = el.parentElement ? parseFloat(window.getComputedStyle(el.parentElement).width) : 0;
          const expectedWidthPx = parentWidth > 0 ? (neckBackBalance / 100) * parentWidth : 0;
          
          // Debug: log update untuk elemen pertama dan kedua (hanya jika ada perbedaan signifikan)
          if (index < 2 && (!window._lastBalanceLog || Date.now() - window._lastBalanceLog > 2000)) {
            const widthDiff = Math.abs(actualWidth - expectedWidthPx);
            // Hanya log jika perbedaannya lebih dari 2px (untuk menghindari false positives karena rounding)
            if (widthDiff > 2 && parentWidth > 0) {
              console.log(`[SitSense] Updated FB fill element ${index + 1}: width=${neckBackBalance}%, computed=${computedWidth}, expected=${expectedWidthPx.toFixed(2)}px, diff=${widthDiff.toFixed(2)}px`);
            }
          }
        } else {
          console.warn(`[SitSense] FB fill element ${index} not found`);
        }
      });
      
      fbValElements.forEach((el, index) => {
        if (el) {
          const newValue = Math.round(neckBackBalance) + '%';
          // Force update dengan multiple methods untuk memastikan
          el.textContent = newValue;
          el.innerHTML = newValue;
          el.innerText = newValue;
          // Set attribute juga untuk memastikan
          if (el.firstChild) {
            el.firstChild.textContent = newValue;
          }
          
          // Debug log dengan verifikasi
          if (index < 2 && (!window._lastBalanceLog || Date.now() - window._lastBalanceLog > 2000)) {
            const actualValue = el.textContent.trim();
            console.log(`[SitSense] Updated FB value element ${index + 1} to ${newValue} (actual: ${actualValue})`);
            if (actualValue !== newValue) {
              console.warn(`[SitSense] Value mismatch! Expected ${newValue}, got ${actualValue}`);
            }
          }
        } else {
          console.warn(`[SitSense] FB value element ${index} not found`);
        }
      });
      
      // Jika tidak ada elemen yang ditemukan, coba lagi dengan selector yang lebih spesifik
      if (fbValElements.length === 0) {
        console.warn('[SitSense] No FB value elements found, trying alternative selector...');
        const altElements = document.querySelectorAll('span#balanceFBVal, #balanceFBVal');
        altElements.forEach(el => {
          if (el) {
            const newValue = Math.round(neckBackBalance) + '%';
            el.textContent = newValue;
            el.innerHTML = newValue;
            el.innerText = newValue;
            if (el.firstChild) {
              el.firstChild.textContent = newValue;
            }
            console.log('[SitSense] Updated FB value via alternative selector to', newValue);
          }
        });
      }
      
      return {
        lrFill: lrFillElements.length,
        fbFill: fbFillElements.length,
        lrVal: lrValElements.length,
        fbVal: fbValElements.length
      };
    };
    
    // Panggil update
    const elementCounts = updateBalanceElements();
    
    // Jika tidak semua elemen ditemukan, coba lagi setelah delay
    if (elementCounts.lrFill < 2 || elementCounts.fbFill < 2 || elementCounts.lrVal < 2 || elementCounts.fbVal < 2) {
      // Retry setelah 100ms untuk memastikan semua elemen sudah dimuat
      setTimeout(() => {
        const retryCounts = updateBalanceElements();
        console.log('[SitSense] Retry update - FSR Fill:', retryCounts.lrFill, 'FB Fill:', retryCounts.fbFill,
                    'FSR Val:', retryCounts.lrVal, 'FB Val:', retryCounts.fbVal);
      }, 100);
    }
    
    // Log setiap 2 detik untuk mengurangi spam
    if (!window._lastBalanceLog || Date.now() - window._lastBalanceLog > 2000) {
      console.log('[SitSense] Balance UI Update - FSR:', fsrBalance + '%', 'Leher-Punggung:', neckBackBalance + '%', 
                  '(Back:', backDist?.toFixed(2), 'cm, Neck:', neckDist?.toFixed(2), 'cm)');
      console.log('[SitSense] Elements found - FSR Fill:', elementCounts.lrFill, 'FB Fill:', elementCounts.fbFill,
                  'FSR Val:', elementCounts.lrVal, 'FB Val:', elementCounts.fbVal);
      
      // Jika tidak ada elemen yang ditemukan, log warning
      if (elementCounts.lrFill === 0 || elementCounts.fbFill === 0) {
        console.warn('[SitSense] Balance elements not found! Make sure DOM is loaded.');
      } else if (elementCounts.lrFill < 2 || elementCounts.fbFill < 2) {
        // Jika hanya menemukan 1 elemen, berarti panel-parameters belum dimuat
        console.log('[SitSense] Only found 1 set of balance elements. Waiting for panel-parameters to load...');
      } else {
        console.log('[SitSense] Successfully updated', elementCounts.lrFill, 'FSR elements and', elementCounts.fbFill, 'FB elements');
      }
      
      // Verifikasi nilai text ter-update
      const testLrVal = document.querySelector('#balanceLRVal');
      const testFbVal = document.querySelector('#balanceFBVal');
      if (testLrVal) {
        console.log('[SitSense] FSR value element text:', testLrVal.textContent, 'Expected:', Math.round(fsrBalance) + '%');
      }
      if (testFbVal) {
        console.log('[SitSense] FB value element text:', testFbVal.textContent, 'Expected:', Math.round(neckBackBalance) + '%');
      }
      
      window._lastBalanceLog = Date.now();
    }
  }
  
  // Export fungsi updateBalanceUI agar bisa dipanggil dari event listener
  window.updateBalanceUI = updateBalanceUI;

  function synthMatrixFromFSR(pct, rows = 8, cols = 8, backDist = null, neckDist = null) {
    // Jika FSR 0, gunakan data ultrasonic untuk membuat visualisasi
    let base = clamp(pct / 100, 0, 1);
    
    // Fallback: Jika FSR 0 tapi ada data ultrasonic, buat visualisasi minimal
    if (base === 0 && backDist !== null && neckDist !== null && 
        backDist > 0 && neckDist > 0 && backDist !== -1 && neckDist !== -1) {
      // Gunakan rata-rata normalized dari back dan neck sebagai base
      // Normalisasi: back (20-35cm ideal) dan neck (25-35cm ideal)
      const backNorm = clamp((backDist - 15) / 20, 0, 1); // 15-35cm -> 0-1
      const neckNorm = clamp((neckDist - 20) / 15, 0, 1); // 20-35cm -> 0-1
      base = (backNorm + neckNorm) / 2 * 0.3; // Max 30% untuk indikator visual
    }
    
    const cx = (cols - 1) / 2, cy = (rows - 1) / 2, maxd = Math.hypot(cx, cy) || 1;
    const out = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(c - cx, r - cy) / maxd;
        // Buat pola radial dari center dengan falloff
        const v = clamp((base * (1 - d * 0.6)) * 100, 0, 100);
        row.push(Math.round(v));
      }
      out.push(row);
    }
    return out;
  }

  // --- Komponen Baru ---
  function updateMainScore(totalScore) {
    // Pastikan score adalah number yang valid
    const score = typeof totalScore === 'number' && isFinite(totalScore) ? totalScore : 0;
    const label = score >= 80 ? 'Baik' : score >= 60 ? 'Perlu Koreksi' : score > 0 ? 'Buruk' : 'Menunggu Data';
    
    if (postureScoreEl) {
      setText(postureScoreEl, score);
    }
    if (postureLabelEl) {
      setText(postureLabelEl, label);
    }
    if (postureScoreBarEl) {
      postureScoreBarEl.value = score;
    }
    
    try {
      window.SitSenseCharts?.updateQuality?.(label);
    } catch (e) {
      // Silent fail
    }
  }

  function updateScoreBreakdown(scores) {
    const back = Math.round(scores.back || 0);
    const neck = Math.round(scores.neck || 0);
    const pressure = Math.round(scores.pressure || 0);
    
    if (backScoreEl) {
      setText(backScoreEl, back);
    }
    if (neckScoreEl) {
      setText(neckScoreEl, neck);
    }
    if (pressureScoreEl) {
      setText(pressureScoreEl, pressure);
    }
    if (backScoreBarEl) {
      backScoreBarEl.value = scores.back || 0;
    }
    if (neckScoreBarEl) {
      neckScoreBarEl.value = scores.neck || 0;
    }
    if (pressureScoreBarEl) {
      pressureScoreBarEl.value = scores.pressure || 0;
    }
  }

  function updateDailyStats() {
    if (sessionData.scores.length === 0) { 
      setText(avgScoreEl, '—'); 
      setText(goodPostureCountEl, '0'); 
      setText(badPostureCountEl, '0');
      // Update hero stats
      updateHeroStats();
      return; 
    }
    const avg = sessionData.scores.reduce((sum, s) => sum + s, 0) / sessionData.scores.length;
    setText(avgScoreEl, Math.round(avg));
    setText(goodPostureCountEl, sessionData.goodCount);
    setText(badPostureCountEl, sessionData.badCount);
    if (timerStart) {
      const elapsed = (Date.now() - timerStart) / 1000;
      const hours = Math.floor(elapsed / 3600), minutes = Math.floor((elapsed % 3600) / 60);
      setText(totalTimeEl, hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`);
    } else {
      setText(totalTimeEl, '—');
    }
    // Update hero stats
    updateHeroStats();
  }

  function updateHeroStats() {
    // Update hero total duration
    const heroTotalDurationEl = document.getElementById('heroTotalDuration');
    if (heroTotalDurationEl && timerStart) {
      const elapsed = (Date.now() - timerStart) / 1000;
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      if (hours > 0) {
        heroTotalDurationEl.textContent = `${hours}:${String(minutes).padStart(2, '0')}`;
      } else {
        heroTotalDurationEl.textContent = `${minutes}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`;
      }
    } else if (heroTotalDurationEl) {
      heroTotalDurationEl.textContent = '00:00';
    }

    // Update hero average score
    const heroAvgScoreEl = document.getElementById('heroAvgScore');
    if (heroAvgScoreEl) {
      if (sessionData.scores.length > 0) {
        const avg = sessionData.scores.reduce((sum, s) => sum + s, 0) / sessionData.scores.length;
        heroAvgScoreEl.textContent = Math.round(avg);
      } else {
        heroAvgScoreEl.textContent = '—';
      }
    }

    // Update hero good posture count
    const heroGoodPostureEl = document.getElementById('heroGoodPosture');
    if (heroGoodPostureEl) {
      heroGoodPostureEl.textContent = sessionData.goodCount || 0;
    }

    // Update hero bad posture count
    const heroBadPostureEl = document.getElementById('heroBadPosture');
    if (heroBadPostureEl) {
      heroBadPostureEl.textContent = sessionData.badCount || 0;
    }
  }
  
  // Export untuk akses global
  window.updateHeroStats = updateHeroStats;
  
  // Initialize hero stats on load
  setTimeout(() => {
    updateHeroStats();
  }, 500);

  function updateRecommendations(scores) {
    let recs = [];
    if (scores.back < 70) recs.push({ type: 'bad', text: 'Posisi Punggung: Sandarkan punggung Anda pada kursi.' });
    if (scores.neck < 70) recs.push({ type: 'bad', text: 'Posisi Leher: Tegakkan leher Anda, jangan membungkuk.' });
    if (scores.pressure < 50) recs.push({ type: 'bad', text: 'Tekanan Duduk: Distribusikan berat badan secara merata.' });
    if (recs.length === 0) recs.push({ type: 'good', text: 'Sempurna! Semua aspek postur Anda sangat baik.' });
    recommendationsEl.innerHTML = recs.map(rec => {
      const color = rec.type === 'good' ? 'text-emerald-400' : 'text-red-400';
      return `<div class="flex items-start gap-2 text-sm ${color}"><i data-lucide="${rec.type === 'good' ? 'check-circle' : 'alert-circle'}" class="h-4 w-4 mt-0.5"></i>${rec.text}</div>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  // =================================================================
  // 6. ALGORITMA SKORING & LOGIKA UTAMA
  // =================================================================
  const fbFromUltrasonic = (back, neck) => {
    if (!Number.isFinite(back) || !Number.isFinite(neck) || back <= 0 || neck <= 0) return 0;
    return clamp(Math.abs(neck - back) / 20.0, 0, 1);
  };

  function calculatePostureScore(backDist, neckDist, fsrVal) {
    let scores = { back: 0, neck: 0, pressure: 0, total: 0 };
    
    // Validasi input
    const backValid = backDist > 0 && backDist !== -1 && isFinite(backDist);
    const neckValid = neckDist > 0 && neckDist !== -1 && isFinite(neckDist);
    const fsrValid = fsrVal > 0 && isFinite(fsrVal);
    
    // Hitung back score (range ideal disesuaikan: 20-35 cm berdasarkan data aktual)
    if (backValid) {
      if (backDist >= 20 && backDist <= 35) {
        scores.back = 100; // Ideal range
      } else if (backDist >= 15 && backDist < 20) {
        scores.back = 80 + ((backDist - 15) / 5) * 20; // Transisi
      } else if (backDist > 35 && backDist <= 50) {
        scores.back = Math.max(0, 100 - ((backDist - 35) * 5)); // Terlalu jauh
      } else if (backDist < 15 && backDist >= 10) {
        scores.back = 60 + ((backDist - 10) / 5) * 20; // Mendekati ideal
      } else if (backDist > 0 && backDist < 10) {
        scores.back = Math.max(0, (backDist / 10) * 60); // Terlalu dekat
      } else if (backDist > 50 && backDist <= 100) {
        scores.back = Math.max(0, 25 - ((backDist - 50) * 0.5)); // Sangat jauh
      }
    }
    
    // Hitung neck score (range ideal disesuaikan: 25-35 cm berdasarkan data aktual)
    if (neckValid) {
      if (neckDist >= 25 && neckDist <= 35) {
        scores.neck = 100; // Ideal range
      } else if (neckDist >= 20 && neckDist < 25) {
        scores.neck = 70 + ((neckDist - 20) / 5) * 30; // Transisi
      } else if (neckDist > 35 && neckDist <= 50) {
        scores.neck = Math.max(0, 100 - ((neckDist - 35) * 3)); // Terlalu jauh
      } else if (neckDist < 20 && neckDist >= 15) {
        scores.neck = 50 + ((neckDist - 15) / 5) * 20; // Mendekati ideal
      } else if (neckDist > 0 && neckDist < 15) {
        scores.neck = Math.max(0, (neckDist / 15) * 50); // Terlalu dekat
      } else if (neckDist > 50 && neckDist <= 100) {
        scores.neck = Math.max(0, 25 - ((neckDist - 50) * 0.5)); // Sangat jauh
      }
    }
    
    // Hitung pressure score (range ideal: 200-800)
    // Jika FSR 0, beri score berdasarkan konsistensi data ultrasonic
    if (fsrValid) {
      if (fsrVal >= 200 && fsrVal <= 800) {
        scores.pressure = 100;
      } else if (fsrVal < 200) {
        scores.pressure = Math.max(0, (fsrVal / 200) * 100);
      } else {
        scores.pressure = Math.max(0, 100 - ((fsrVal - 800) / 10));
      }
    } else if (backValid && neckValid) {
      // Fallback: Jika FSR 0 tapi ada data ultrasonic yang konsisten, beri score minimal
      scores.pressure = 30; // Score minimal untuk menunjukkan sistem aktif
    }
    
    // Hitung total score
    // Jika FSR tidak valid, ubah weight: back 40%, neck 60%
    if (backValid || neckValid || fsrValid) {
      if (fsrValid) {
        scores.total = Math.round((scores.back * 0.35) + (scores.neck * 0.40) + (scores.pressure * 0.25));
      } else {
        // Jika FSR tidak ada, hanya gunakan back dan neck
        scores.total = Math.round((scores.back * 0.40) + (scores.neck * 0.60));
      }
    }
    
    return scores;
  }

  function startTimer() {
    if (timerInterval) return;
    if (!timerStart) timerStart = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      setText(sitDurationEl, fmtDur(elapsed));
      updateDailyStats();
    }, 1000);
  }

  function handleLivePacket(v) {
    // Ekstrak data dengan validasi
    const fsr = Number(v.fsr) || 0;
    let uBack = v?.ultrasonic?.punggung_cm !== undefined ? Number(v.ultrasonic.punggung_cm) : null;
    let uNeck = v?.ultrasonic?.leher_cm !== undefined ? Number(v.ultrasonic.leher_cm) : null;
    
    // KONVERSI: Jika nilai terlalu besar (> 100cm), mungkin dalam satuan yang berbeda
    // Coba konversi dari milimeter atau nilai raw sensor
    if (uBack !== null && uBack > 100) {
      // Jika nilai > 100, coba bagi dengan 10 (mungkin dalam 0.1mm) atau 100 (mungkin dalam mm)
      const backMM = uBack / 10;
      const backCM = uBack / 100;
      
      // Pilih yang paling masuk akal (antara 5-15cm untuk back)
      if (backMM >= 5 && backMM <= 50) {
        uBack = backMM;
        console.log('[SitSense] Converted back from', v.ultrasonic.punggung_cm, 'to', uBack, 'cm (divided by 10)');
      } else if (backCM >= 5 && backCM <= 50) {
        uBack = backCM;
        console.log('[SitSense] Converted back from', v.ultrasonic.punggung_cm, 'to', uBack, 'cm (divided by 100)');
      }
      // Jika masih tidak masuk akal, gunakan nilai asli (akan di-handle oleh calculatePostureScore)
    }
    
    if (uNeck !== null && uNeck > 100) {
      // Jika nilai > 100, coba bagi dengan 10 atau 100
      const neckMM = uNeck / 10;
      const neckCM = uNeck / 100;
      
      // Pilih yang paling masuk akal (antara 30-45cm untuk neck)
      if (neckMM >= 20 && neckMM <= 100) {
        uNeck = neckMM;
        console.log('[SitSense] Converted neck from', v.ultrasonic.leher_cm, 'to', uNeck, 'cm (divided by 10)');
      } else if (neckCM >= 20 && neckCM <= 100) {
        uNeck = neckCM;
        console.log('[SitSense] Converted neck from', v.ultrasonic.leher_cm, 'to', uNeck, 'cm (divided by 100)');
      }
    }
    
    // Cek apakah data valid (bukan -1 atau null)
    const backValid = uBack !== null && uBack !== -1 && isFinite(uBack) && uBack > 0;
    const neckValid = uNeck !== null && uNeck !== -1 && isFinite(uNeck) && uNeck > 0;
    
    // Log data yang diterima (reduced logging)
    if (!window._lastLogTime || Date.now() - window._lastLogTime > 2000) {
      console.log('[SitSense] Data received - FSR:', fsr, 'Back:', uBack, 'cm', 'Neck:', uNeck, 'cm');
      window._lastLogTime = Date.now();
    }

    // Start timer jika ada aktivitas
    if (fsr > 0 || backValid || neckValid) {
      startTimer();
    }

    // Hitung score
    const backDist = backValid ? uBack : 0;
    const neckDist = neckValid ? uNeck : 0;
    const scores = calculatePostureScore(backDist, neckDist, fsr);
    
    // Update session data (selalu update untuk tracking)
    sessionData.scores.push(scores.total);
    if (scores.total < 60) sessionData.badCount++;
    if (scores.total >= 80) sessionData.goodCount++;

    // Panggil SEMUA fungsi update (selalu update, bahkan jika score 0)
    try {
      updateMainScore(scores.total);
      updateScoreBreakdown(scores);
      updateDailyStats();
      updateRecommendations(scores);
      
      // Hitung FSR percentage untuk heatmap dan balance
      const fsrPct = Math.round(clamp(fsr / 4095 * 100, 0, 100));
      
      // Update balance UI dengan data FSR, back, dan neck
      // Simpan data untuk update ulang setelah panel-parameters dimuat
      lastBalanceData = { fsrPct, backDist: uBack, neckDist: uNeck };
      
      // Panggil updateBalanceUI - pastikan dipanggil setiap kali data baru
      if (typeof updateBalanceUI === 'function') {
        updateBalanceUI(fsrPct, uBack, uNeck);
      } else if (window.updateBalanceUI) {
        window.updateBalanceUI(fsrPct, uBack, uNeck);
      } else {
        console.warn('[SitSense] updateBalanceUI function not available');
      }
      
      // Update heatmap dengan matrix dari FSR (dengan fallback ultrasonic jika FSR 0)
      try {
        const heatmapMatrix = synthMatrixFromFSR(fsrPct, 8, 8, uBack, uNeck);
        if (window.updateHeatmap) {
          window.updateHeatmap(heatmapMatrix);
          // Log hanya setiap beberapa detik untuk mengurangi spam
          if (!window._lastHeatmapLog || Date.now() - window._lastHeatmapLog > 3000) {
            const source = fsrPct > 0 ? 'FSR' : 'Ultrasonic (fallback)';
            console.log('[SitSense] Heatmap updated - Source:', source, 'FSR:', fsrPct + '%', 
                        'Back:', uBack?.toFixed(2), 'cm', 'Neck:', uNeck?.toFixed(2), 'cm');
            window._lastHeatmapLog = Date.now();
          }
        } else {
          // Coba inisialisasi jika belum ada
          const canvas = document.getElementById('heatmapCanvas');
          if (canvas && window.initPostureVisual) {
            window.initPostureVisual({ canvasId: 'heatmapCanvas' });
            // Coba update lagi setelah inisialisasi
            setTimeout(() => {
              if (window.updateHeatmap) {
                window.updateHeatmap(heatmapMatrix);
              }
            }, 100);
          }
        }
      } catch (e) {
        console.error('[SitSense] Heatmap update error:', e);
      }
      
      // Update charts
      try {
        if (window.SitSenseCharts?.pushPressure) {
          window.SitSenseCharts.pushPressure(fsrPct);
        }
      } catch (e) {
        console.error('[SitSense] Charts update error:', e);
      }
    } catch (error) {
      console.error('[SitSense] Error updating UI:', error);
    }
  }

  // =================================================================
  // 7. BINDING & BOOT SEQUENCE FIREBASE (seperti test connection)
  // =================================================================
  function detachAll() {
    if (liveRef) { liveRef.off(); liveRef = null; }
    if (infoRef) { infoRef.off(); infoRef = null; }
  }

  async function resolveDeviceId() {
    // Cek URL parameter
    const qp = (k) => new URL(location.href).searchParams.get(k);
    const urlId = qp('device');
    if (urlId) { 
      localStorage.setItem('sitsense_device', urlId); 
      console.log('[SitSense] Device ID dari URL:', urlId);
      return urlId; 
    }
    
    // Cek localStorage
    const saved = localStorage.getItem('sitsense_device');
    if (saved && saved !== 'auto') {
      console.log('[SitSense] Device ID dari localStorage:', saved);
      return saved;
    }
    
    // Auto-detect dari Firebase (seperti test connection)
    try {
      console.log('[SitSense] Mencari device ID dari Firebase...');
      const snap = await db.ref('/devices').limitToFirst(1).get();
      if (snap.exists()) {
        const firstKey = Object.keys(snap.val())[0];
        if (firstKey) {
          localStorage.setItem('sitsense_device', firstKey);
          console.log('[SitSense] Device ID auto-detected:', firstKey);
          return firstKey;
        }
      } else {
        console.warn('[SitSense] Tidak ada data di /devices/');
      }
    } catch (err) {
      console.error('[SitSense] Error resolving device ID:', err);
    }
    return null;
  }

  async function attachForDevice(deviceId) {
    detachAll();
    
    if (!deviceId) {
      setDeviceMeta({ status: 'Device tidak ditemukan' });
      console.warn('[SitSense] Device ID tidak ditemukan');
      return;
    }
    
    console.log('[SitSense] Menyambung ke device:', deviceId);
    setDeviceMeta({ status: `Menyambung ke ${deviceId}...` });
    
    liveRef = db.ref(`/devices/${deviceId}/live`);
    infoRef = db.ref(`/devices/${deviceId}/info`);

    // Monitor koneksi Firebase
    db.ref('.info/connected').on('value', s => {
      const connected = s.val();
      setStatusWifi(connected ? 'Tersambung' : 'Terputus', connected);
      console.log('[SitSense] Firebase connected:', connected);
    });

    // Listener untuk info device
    infoRef.on('value', s => {
      if (!s.exists()) {
        console.log('[SitSense] No info data untuk device:', deviceId);
        return;
      }
      const v = s.val() || {};
      console.log('[SitSense] Device info received:', v);
      setDeviceMeta({ ip: v.ip || '—', fw: v.fw || '—', status: v.status || 'Online' });
    });
    
    // Listener untuk live data (PENTING: seperti test connection - tidak cek exists dulu)
    liveRef.on('value', s => {
      const v = s.val();
      if (!v) {
        console.log('[SitSense] No live data (null) untuk device:', deviceId);
        return;
      }
      console.log('[SitSense] Live data received untuk device', deviceId, ':', v);
      handleLivePacket(v);
    });
    
    console.log('[SitSense] Listeners terpasang untuk device:', deviceId);
  }

  // --- GO! --- (seperti test connection)
  console.log('[SitSense] Starting Firebase connection...');
  console.log('[SitSense] Auth available:', !!auth);
  console.log('[SitSense] DB available:', !!db);
  
  if (!auth || !db) {
    console.error('[SitSense] Auth atau DB tidak tersedia!');
    setStatusAuth('Gagal');
    setStatusWifi('Firebase Gagal', false);
    return;
  }

  auth.signInAnonymously()
    .then(async () => {
      setStatusAuth('Masuk (anonim)');
      console.log('[SitSense] Auth berhasil - User ID:', auth.currentUser?.uid);
      
      const devId = await resolveDeviceId();
      console.log('[SitSense] Device ID resolved:', devId);
      
      if (!devId) {
        console.error('[SitSense] Tidak ada device ID yang ditemukan!');
        setDeviceMeta({ status: 'Device tidak ditemukan' });
        return;
      }
      
      await attachForDevice(devId);
    })
    .catch(err => {
      console.error('[SitSense] Auth failed:', err);
      setStatusAuth('Gagal Auth');
      setStatusWifi('Gagal', false);
    });
});
