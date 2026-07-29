// Load courses on the main page
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon();
    }
    
    const cursosGrid = document.getElementById('cursos-grid');
    
    if (cursosGrid) {
        renderCursos();
    }
    
    // Check if we're on a detail page
    const urlParams = new URLSearchParams(window.location.search);
    const cursoId = urlParams.get('curso');
    
    if (cursoId) {
        renderCursoDetail(cursoId);
    }
    
    // Search input event listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchCursos();
            }
        });
    }
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const btn = document.getElementById('dark-mode-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    }
}

function renderCursos(filteredCursos = null) {
    const cursosGrid = document.getElementById('cursos-grid');
    const cursosToRender = filteredCursos || cursos;
    
    cursosGrid.innerHTML = '';
    
    cursosToRender.forEach(curso => {
        const card = document.createElement('div');
        card.className = 'curso-card';
        card.innerHTML = `
            <div class="curso-image">${curso.emoji}</div>
            <div class="curso-content">
                <span class="curso-tag">${curso.categoria}</span>
                <h3 class="curso-title">${curso.titulo}</h3>
                <p class="curso-description">${curso.descricao}</p>
                <div class="curso-rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-number">${curso.avaliacao}</span>
                </div>
                <p class="curso-price">Grátis</p>
                <div class="curso-meta">
                    <span>⏱️ ${curso.duracao}</span>
                    <span>📊 ${curso.nivel}</span>
                </div>
                <div class="curso-share">
                    <a href="${curso.kiwifyLink}" target="_blank" class="btn btn-primary btn-buy">
                        <i data-lucide="shopping-cart"></i> Comprar Agora
                    </a>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `curso.html?curso=${curso.id}`;
        });
        
        cursosGrid.appendChild(card);
    });
}

function searchCursos() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredCursos = cursos.filter(curso => 
        curso.titulo.toLowerCase().includes(searchTerm) ||
        curso.descricao.toLowerCase().includes(searchTerm) ||
        curso.categoria.toLowerCase().includes(searchTerm)
    );
    renderCursos(filteredCursos);
}

function filterCursos(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
    
    // Filter courses
    if (category === 'all') {
        renderCursos();
    } else {
        const filteredCursos = cursos.filter(curso => curso.categoria === category);
        renderCursos(filteredCursos);
    }
}

function shareCurso(cursoId) {
    const curso = cursos.find(c => c.id === cursoId);
    const shareText = `Confira este curso gratuito: ${curso.titulo} - ${curso.descricao}`;
    const shareUrl = window.location.href.split('?')[0] + `?curso=${curso.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: curso.titulo,
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Erro ao compartilhar:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copiado para a área de transferência!');
        }).catch(err => {
            alert('Erro ao copiar link. Tente manualmente.');
        });
    }
}

function irParaCheckout(cursoId) {
    window.location.href = `checkout.html?curso=${cursoId}`;
}

function renderCursoDetail(cursoId) {
    const curso = cursos.find(c => c.id === parseInt(cursoId));
    
    if (!curso) {
        window.location.href = 'index.html';
        return;
    }
    
    const container = document.querySelector('.container');
    
    container.innerHTML = `
        <a href="index.html" class="btn-back">← Voltar para Cursos</a>
        <div class="curso-detail-header">
            <h1>${curso.emoji} ${curso.titulo}</h1>
            <p>${curso.categoria} • ${curso.nivel} • ${curso.duracao}</p>
        </div>
        
        <div class="curso-detail-content">
            <h2>Sobre o Curso</h2>
            <p>${curso.descricao}</p>
            
            <h2>Conteúdo do Curso</h2>
            <div id="acesso-curso" class="accesso-curso">
                <p>Para acessar o conteúdo completo do curso, digite o código de acesso:</p>
                <div class="codigo-input-container">
                    <input type="text" id="codigo-acesso" placeholder="Digite o código de acesso" class="codigo-input">
                    <button onclick="validarCodigo(${curso.id})" class="btn btn-primary">Acessar</button>
                </div>
                <p id="erro-codigo" class="erro-codigo"></p>
            </div>
            
            <div id="curso-conteudo" class="curso-conteudo-text" style="display: none;">
                ${formatCursoText(curso.conteudoTexto)}
            </div>
        </div>
    `;
}

function validarCodigo(cursoId) {
    const curso = cursos.find(c => c.id === cursoId);
    const codigoDigitado = document.getElementById('codigo-acesso').value.trim();
    const erroDiv = document.getElementById('erro-codigo');
    const acessoDiv = document.getElementById('acesso-curso');
    const conteudoDiv = document.getElementById('curso-conteudo');
    
    if (codigoDigitado === curso.codigoAcesso) {
        // Código correto - mostrar conteúdo
        acessoDiv.style.display = 'none';
        conteudoDiv.style.display = 'block';
    } else {
        // Código incorreto - mostrar erro
        erroDiv.textContent = 'Código incorreto. Tente novamente.';
        erroDiv.style.color = '#e74c3c';
    }
}

function formatCursoText(text) {
    // Converter quebras de linha em <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Formatar títulos (linhas em maiúsculas com =====)
    formatted = formatted.replace(/([A-ZÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+)=+<br>/g, '<h3>$1</h3>');
    
    // Formatar subtítulos (linhas com ----)
    formatted = formatted.replace(/([A-ZÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+)-+<br>/g, '<h4>$1</h4>');
    
    // Formatar seções com ===
    formatted = formatted.replace(/([A-ZÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+)=+/g, '<h3>$1</h3>');
    
    // Formatar listas com -
    formatted = formatted.replace(/^- (.+)<br>/g, '<li>$1</li>');
    
    // Envolver listas adjacentas em <ul>
    formatted = formatted.replace(/(<li>.+<\/li><br>)+/g, function(match) {
        return '<ul>' + match.replace(/<br>/g, '') + '</ul><br>';
    });
    
    // Formatar CONCLUSÃO
    formatted = formatted.replace(/CONCLUSÃO=+<br>/g, '<div class="conclusao"><h3>CONCLUSÃO</h3>');
    formatted = formatted.replace(/<\/div><br>/g, '</div>');
    
    return formatted;
}

function copiarPix(pixKey) {
    navigator.clipboard.writeText(pixKey).then(() => {
        alert('Chave Pix copiada para a área de transferência!');
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = pixKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Chave Pix copiada para a área de transferência!');
    });
}
