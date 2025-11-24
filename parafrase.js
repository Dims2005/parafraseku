// Paraphrase Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeParaphrasePage();
});

function initializeParaphrasePage() {
    const inputText = document.getElementById('inputText');
    const paraphraseBtn = document.getElementById('paraphraseBtn');
    const resultSection = document.getElementById('resultSection');
    const resultText = document.getElementById('resultText');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const newParaphraseBtn = document.getElementById('newParaphraseBtn');
    const charCount = document.getElementById('charCount');
    const styleBubbles = document.querySelectorAll('.style-bubble');
    
    const processTimeElement = document.getElementById('processTime');
    const charCountResult = document.getElementById('charCountResult');
    const styleUsed = document.getElementById('styleUsed');
    
    let selectedMode = 'sederhana';
    let startTime;

    // Check if required elements exist
    if (!inputText || !paraphraseBtn) {
        console.log('Paraphrase elements not found');
        return;
    }

    // Character count with fun feedback
    inputText.addEventListener('input', function() {
        const count = this.value.length;
        if (charCount) {
            charCount.textContent = `${count}/3000 karakter`;
            
            if (count > 2500) {
                charCount.className = 'char-count-fun warning';
            } else if (count > 2900) {
                charCount.className = 'char-count-fun danger';
                charCount.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    charCount.style.animation = '';
                }, 500);
            } else {
                charCount.className = 'char-count-fun';
            }
        }
    });

    // Style bubble selection
    styleBubbles.forEach(bubble => {
        bubble.addEventListener('click', function() {
            styleBubbles.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedMode = this.dataset.mode;
            if (styleUsed) {
                styleUsed.textContent = this.querySelector('span').textContent;
            }
            
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 200);
        });
    });

    // Paraphrase button
    paraphraseBtn.addEventListener('click', async function() {
        const text = inputText.value.trim();
        
        if (!text) {
            showFunNotification('📝 Tulis teks dulu ya!', 'warning');
            inputText.focus();
            return;
        }

        if (text.length > 3000) {
            showFunNotification('🚫 Teksnya kepanjangan! Maksimal 3000 karakter.', 'error');
            return;
        }

        // Start timer
        startTime = Date.now();
        
        // Show loading state
        const spinner = paraphraseBtn.querySelector('.sparkle-loader');
        const btnText = paraphraseBtn.querySelector('span');
        
        paraphraseBtn.disabled = true;
        if (btnText) btnText.textContent = 'Sedang menyihir teks...';
        if (spinner) spinner.style.display = 'flex';
        
        inputText.style.animation = 'pulse 1s infinite';

        try {
            const response = await fetch('/api/parafrase', {  // ✅ PERBAIKI PATH
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    mode: selectedMode
                })
            });

            const data = await response.json();

            if (data.success) {
                // Calculate processing time
                const endTime = Date.now();
                const processTime = ((endTime - startTime) / 1000).toFixed(1);
                
                if (resultText) resultText.textContent = data.paraphrased;
                if (resultSection) {
                    resultSection.style.display = 'block';
                    showConfetti();
                }
                
                // Update stats
                if (processTimeElement) processTimeElement.textContent = processTime;
                if (charCountResult) charCountResult.textContent = data.paraphrased.length;
                if (styleUsed) {
                    styleUsed.textContent = selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1);
                }
                
                // Scroll to result
                if (resultSection) {
                    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                showFunNotification('🎉 Parafrase berhasil!', 'success');
                
            } else {
                throw new Error(data.error || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error:', error);
            showFunNotification('❌ Gagal memparafrase: ' + error.message, 'error');
        } finally {
            // Reset loading state
            paraphraseBtn.disabled = false;
            if (btnText) btnText.textContent = 'Mulai Parafrase Ajaib!';
            if (spinner) spinner.style.display = 'none';
            inputText.style.animation = '';
        }
    });

    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const textToCopy = resultText?.textContent || '';
            if (!textToCopy) {
                showFunNotification('📝 Tidak ada teks untuk disalin!', 'warning');
                return;
            }

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Disalin!';
                showFunNotification('✅ Teks berhasil disalin!', 'success');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Salin';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                showFunNotification('❌ Gagal menyalin teks', 'error');
            });
        });
    }

    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const textToDownload = resultText?.textContent || '';
            if (!textToDownload) {
                showFunNotification('📝 Tidak ada teks untuk diunduh!', 'warning');
                return;
            }

            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parafrase-${selectedMode}-${new Date().getTime()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showFunNotification('💾 File berhasil diunduh!', 'success');
        });
    }

    // New Paraphrase button
    if (newParaphraseBtn) {
        newParaphraseBtn.addEventListener('click', function() {
            inputText.value = '';
            if (resultSection) resultSection.style.display = 'none';
            if (charCount) {
                charCount.textContent = '0/3000 karakter';
                charCount.className = 'char-count-fun';
            }
            showFunNotification('🔄 Siap untuk parafrase baru!', 'info');
            inputText.focus();
        });
    }

    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const textToShare = resultText?.textContent || '';
            if (!textToShare) {
                showFunNotification('📝 Tidak ada teks untuk dibagikan!', 'warning');
                return;
            }

            if (navigator.share) {
                navigator.share({
                    title: 'Hasil Parafrase dari ParafraseKu',
                    text: textToShare,
                    url: window.location.href
                }).then(() => {
                    showFunNotification('📤 Berhasil dibagikan!', 'success');
                }).catch(err => {
                    console.error('Error sharing:', err);
                    showFunNotification('❌ Gagal membagikan', 'error');
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(textToShare).then(() => {
                    showFunNotification('📋 Teks disalin (share tidak didukung)', 'info');
                });
            }
        });
    }
}

// Include helper functions (sama seperti di dashboard.js)
function showFunNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fun-notification ${type}`;
    
    const icons = {
        success: '🎉',
        error: '❌',
        warning: '⚠️',
        info: '💡'
    };
    
    notification.innerHTML = `
        <div class="notification-emoji">${icons[type] || '💡'}</div>
        <div class="notification-text">${message}</div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        border-left: 5px solid ${getNotificationColor(type)};
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-family: inherit;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getNotificationColor(type) {
    const colors = {
        success: '#4ECDC4',
        error: '#FF6B6B',
        warning: '#FFD166',
        info: '#9B5DE5'
    };
    return colors[type] || '#9B5DE5';
}

function showConfetti() {
    const confettiCount = 100;
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#9B5DE5', '#118AB2'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.innerHTML = '🎉';
        confetti.style.cssText = `
            position: fixed;
            top: -50px;
            left: ${Math.random() * 100}%;
            font-size: ${Math.random() * 20 + 10}px;
            z-index: 9999;
            pointer-events: none;
            animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (document.body.contains(confetti)) {
                document.body.removeChild(confetti);
            }
        }, 5000);
    }
}

console.log('🎉 Paraphrase Page loaded successfully!');