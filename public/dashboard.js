// Home Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

function initializeHomePage() {
    setupFunInteractions();
    createFloatingEmojis();
}

function setupFunInteractions() {
    // Add click sounds or other fun interactions
    const buttons = document.querySelectorAll('button, .feature-card, .game-card');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add subtle animation feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function createFloatingEmojis() {
    const emojis = ['✨', '🎨', '📝', '🤖', '💫', '🚀', '🎯', '💡'];
    const container = document.querySelector('.floating-elements');
    
    // Clear existing emojis
    if (container) {
        container.innerHTML = '';
        
        // Create more floating emojis
        for (let i = 0; i < 8; i++) {
            const emoji = document.createElement('div');
            emoji.className = 'floating-emoji';
            emoji.textContent = emojis[i];
            emoji.style.left = `${Math.random() * 90}%`;
            emoji.style.top = `${Math.random() * 90}%`;
            emoji.style.animationDelay = `${Math.random() * 6}s`;
            emoji.style.fontSize = `${Math.random() * 1 + 1.5}rem`;
            container.appendChild(emoji);
        }
    }
}

function showFeature(featureId) {
    // Hide all features
    document.querySelectorAll('.feature-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected feature
    const targetFeature = document.getElementById(featureId);
    if (targetFeature) {
        targetFeature.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Add celebration for feature switch
    if (featureId === 'game') {
        showConfetti();
    }
}

// Game functions
function startGame(gameType) {
    showFunNotification(`🎮 Memulai ${getGameName(gameType)}!`, 'info');
    
    // Simple game implementations
    switch(gameType) {
        case 'tebakGaya':
            startTebakGaya();
            break;
        case 'cepat':
            startParafraseCepat();
            break;
        case 'challenge':
            startChallenge();
            break;
    }
}

function getGameName(gameType) {
    const names = {
        'tebakGaya': 'Tebak Gaya',
        'cepat': 'Parafrase Cepat',
        'challenge': 'Challenge'
    };
    return names[gameType] || 'Game';
}

function startTebakGaya() {
    const sampleTexts = [
        "Pemanasan global merupakan masalah serius yang harus diatasi bersama-sama",
        "Hari ini cuaca sangat cerah dan cocok untuk beraktivitas di luar ruangan",
        "Teknologi artificial intelligence berkembang dengan sangat pesat akhir-akhir ini"
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const userAnswer = prompt(`Tebak gaya parafrase untuk teks:\n\n"${randomText}"\n\nPilihan: sederhana, formal, kreatif, akademik`);
    
    if (userAnswer) {
        showFunNotification(`🎯 Jawaban kamu: ${userAnswer}`, 'info');
    }
}

function startParafraseCepat() {
    showFunNotification('⏰ Siap-siap! Game parafrase cepat akan dimulai...', 'warning');
    // Implement timer-based game
}

function startChallenge() {
    showFunNotification('🏆 Challenge mode diaktifkan!', 'success');
    // Implement challenge game
}

// Fun notification system
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
    
    // Add styles
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
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
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

// Confetti effect
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
        
        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(confetti)) {
                document.body.removeChild(confetti);
            }
        }, 5000);
    }
    
    // Add confetti animation to CSS if not exists
    if (!document.querySelector('#confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confetti-fall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
}

console.log('🎉 Home Page loaded successfully!');