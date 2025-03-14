// URL do arquivo JSON com as informações dos cursos
const coursesUrl = '/courses/c/courses.json';

// Função para carregar todos os cursos
async function loadAllCourses() {
    // Referência para o container onde os cursos serão exibidos
    const coursesContainer = document.getElementById('courses-container');

    try {
        // Fazendo uma requisição para pegar os dados dos cursos
        const response = await fetch(coursesUrl);
        const data = await response.json();
        
        // Variável para controlar o atraso das animações de fadeIn
        let time = 0;

        // Exibe os cursos na tela, criando um cartão para cada um
        coursesContainer.innerHTML = Object.entries(data.courses).map(([courseId, course]) => `
            <div class="col-md-4 wow fadeInUp" data-wow-delay="0.${++time*2}s">
                <div class="course-card">
                    <img src="${course.coverImage || '/img/cat-1.jpg'}" alt="${course.title}">
                    <div class="course-card-body">
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                    </div>
                    <div class="course-card-footer">
                        <div>
                            <small class="text-muted">${course.duration}</small><br>
                            <small class="text-muted">${course.totalLessons} lições</small>
                        </div>
                        <a href="/courses/course.html?course_id=${courseId}" class="btn btn-primary btn-sm">Iniciar Curso</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
    catch (error) {
        // Caso ocorra um erro ao carregar os cursos, exibe uma mensagem
        console.error('Erro ao carregar cursos:', error);
        coursesContainer.innerHTML = `
            <div class="col-12 text-center">
                <h2>Erro ao carregar cursos</h2>
                <p>Por favor, tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Função para carregar um curso específico
async function loadCourse(courseId) {
    // Referências para os elementos onde os dados do curso serão exibidos
    const moduleContainer = document.getElementById('modules-container');
    const courseTitle = document.getElementById('course-title');
    const courseDetails = document.getElementById('course-details');

    try {
        // Requisição para pegar os dados dos cursos
        const response = await fetch(coursesUrl);
        const data = await response.json();

        // Verifica se o curso com o ID fornecido existe
        if (!data.courses.hasOwnProperty(courseId)) {
            console.error('Course ID not found');
            window.location.href = '/courses/'; // Redireciona para a página de cursos
            return;
        }

        const course = data.courses[courseId];

        // Exibe o título do curso
        courseTitle.textContent = course.title;

        let totalLessons = 0;
        let i = 0;

        // Exibe os módulos e lições do curso
        moduleContainer.innerHTML = course.modules.map(module => `
            <div class="module mb-3">
                <div class="module-header d-flex align-items-center" data-module-id="${module.id}">
                    Módulo ${++i}: ${module.title}
                    <i class="fas fa-chevron-down ms-auto"></i>
                </div>
                <div class="lessons" data-module-id="${module.id}" style="display:none;">
                    ${module.lessons.map(lesson => `
                        <div class="lesson ${!lesson.active ? 'lesson-inactive' : ''}" 
                             data-lesson-file="${lesson.contentFile}" 
                             data-lesson-id="${++totalLessons}"
                             onclick="${lesson.active ? `loadLessonContent('${lesson.contentFile}')` : 'void(0)'}">
                            <i class="fas fa-file-alt me-2 ${!lesson.active ? 'text-muted' : ''}"></i>
                            ${lesson.title}
                            <span class="ms-auto text-muted">
                                ${lesson.active ? lesson.duration : 'Em breve'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Exibe o total de duração do curso e o número de lições
        courseDetails.textContent = `${course.duration} / ${totalLessons} lições`;

        // Adiciona a funcionalidade de toggle para os módulos
        document.querySelectorAll('.module-header').forEach(header => {
            header.addEventListener('click', function() {
                const moduleId = this.dataset.moduleId;
                const lessonsContainer = document.querySelector(`.lessons[data-module-id="${moduleId}"]`);
                const icon = this.querySelector('i');

                // Alterna a visibilidade das lições
                lessonsContainer.style.display =
                    lessonsContainer.style.display === 'none' ? 'block' : 'none';

                // Alterna o ícone entre seta para cima e para baixo
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });

        // Desabilita o clique nas lições inativas
        document.querySelectorAll('.lesson-inactive').forEach(lesson => {
            lesson.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Esta lição ainda não está disponível.');
            });
        });

    }
    catch (error) {
        // Exibe mensagem de erro caso algo dê errado ao carregar o curso
        console.error('Erro ao carregar cursos:', error);
        moduleContainer.innerHTML = 'Erro ao carregar cursos.';
        window.location.href = '/courses/'; // Redireciona para a página de cursos
    }
}

// Função para carregar o conteúdo de uma lição
window.loadLessonContent = async function(contentFile) {
    // Referência para o container onde o conteúdo da lição será exibido
    const lessonContent = document.getElementById('lesson-markdown-content');

    // Faz a requisição para obter o conteúdo da lição
    const response = await fetch(contentFile);

    // Se houver erro ao carregar o conteúdo da lição, exibe uma mensagem de erro
    if (!response.ok) {
        lessonContent.innerHTML = `
            <div style="text-align: center; color: red;">
                <h2>Erro ao carregar lição</h2>
                <p>A lição solicitada não está disponível.</p>
                <button onclick="window.location.href='/courses/courses.html?course_id=${courseId}'">Voltar para o Curso</button>
            </div>
        `;
        return;
    }

    // Converte o conteúdo da lição em Markdown e exibe
    const markdownText = await response.text();
    lessonContent.innerHTML = marked.parse(markdownText);
}
