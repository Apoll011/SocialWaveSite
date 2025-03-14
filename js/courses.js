const coursesUrl = '/courses/c/courses.json';

async function loadAllCourses() {
    const coursesContainer = document.getElementById('courses-container');

    try {
        const response = await fetch(coursesUrl);
        const data = await response.json();
        let time = 0;
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
        console.error('Erro ao carregar cursos:', error);
        coursesContainer.innerHTML = `
                        <div class="col-12 text-center">
                            <h2>Erro ao carregar cursos</h2>
                            <p>Por favor, tente novamente mais tarde.</p>
                        </div>
                    `;
    }
}
async function loadCourse(courseId) {
    const moduleContainer = document.getElementById('modules-container');
    const courseTitle = document.getElementById('course-title');
    const courseDetails = document.getElementById('course-details');

    try {
        const response = await fetch(coursesUrl);
        const data = await response.json();

        if (!data.courses.hasOwnProperty(courseId)) {
            console.error('Course ID not found');
            window.location.href = '/courses/';
            return;
        }

        const course = data.courses[courseId];

        courseTitle.textContent = course.title;
        let totalLessons = 0
        let i = 0;
        moduleContainer.innerHTML = course.modules.map(module => `
                <div class="module mb-3">
                    <div class="module-header d-flex align-items-center"
                         data-module-id="${module.id}">
                        Módulo ${++i}: ${module.title}
                        <i class="fas fa-chevron-down ms-auto"></i>
                    </div>
                    <div class="lessons" data-module-id="${module.id}" style="display:none;">
                        ${module.lessons.map(lesson => `
                            <div class="lesson ${!lesson.active ? 'lesson-inactive' : ''}"
                                 data-lesson-file="${lesson.contentFile}" data-lesson-id="${++totalLessons}"
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

        courseDetails.textContent = `${course.duration} / ${totalLessons} lições`;


        document.querySelectorAll('.module-header').forEach(header => {
            header.addEventListener('click', function() {
                const moduleId = this.dataset.moduleId;
                const lessonsContainer = document.querySelector(`.lessons[data-module-id="${moduleId}"]`);
                const icon = this.querySelector('i');

                lessonsContainer.style.display =
                    lessonsContainer.style.display === 'none' ? 'block' : 'none';

                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });

        // Disable click events for inactive lessons
        document.querySelectorAll('.lesson-inactive').forEach(lesson => {
            lesson.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Esta lição ainda não está disponível.');
            });
        });

    }
    catch (error) {
        console.error('Erro ao carregar cursos:', error);
        moduleContainer.innerHTML = 'Erro ao carregar cursos.';
        window.location.href = '/courses/';
    }
}

window.loadLessonContent = async function(contentFile) {
    const lessonContent = document.getElementById('lesson-markdown-content');
    const response = await fetch(contentFile);

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

    const markdownText = await response.text();
    lessonContent.innerHTML = marked.parse(markdownText);
}
