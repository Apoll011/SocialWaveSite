<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration
define('BASE_PATH', '/courses/c/');
define('JSON_FILE', BASE_PATH . 'courses.json');

// Utility Functions
function loadCourses() {
    $json = file_get_contents(JSON_FILE);
    return json_decode($json, true);
}

function saveCourses($courses) {
    $json = json_encode($courses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents(JSON_FILE, $json);
}

function saveMarkdownFile($path, $content) {
    // Ensure directory exists
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return file_put_contents($path, $content);
}

function deleteFile($path) {
    return unlink($path);
}

// Handle AJAX Requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch($action) {
        case 'update_course':
            $courses = loadCourses();
            $courseId = $_POST['course_id'];
            $courseIndex = array_search($courseId, array_column($courses['courses'], 'id'));

            if ($courseIndex !== false) {
                $courses['courses'][$courseIndex]['title'] = $_POST['title'];
                $courses['courses'][$courseIndex]['duration'] = $_POST['duration'];
                $courses['courses'][$courseIndex]['description'] = $_POST['description'];

                if (saveCourses($courses)) {
                    echo json_encode(['status' => 'success']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Could not save courses']);
                }
            }
            break;

        case 'update_module':
            $courses = loadCourses();
            $courseId = $_POST['course_id'];
            $moduleId = $_POST['module_id'];

            foreach ($courses['courses'] as &$course) {
                if ($course['id'] === $courseId) {
                    foreach ($course['modules'] as &$module) {
                        if ($module['id'] === $moduleId) {
                            $module['title'] = $_POST['module_title'];
                            break 2;
                        }
                    }
                }
            }

            if (saveCourses($courses)) {
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Could not save courses']);
            }
            break;

        case 'update_lesson':
            $courses = loadCourses();
            $courseId = $_POST['course_id'];
            $moduleId = $_POST['module_id'];
            $lessonId = $_POST['lesson_id'];

            foreach ($courses['courses'] as &$course) {
                if ($course['id'] === $courseId) {
                    foreach ($course['modules'] as &$module) {
                        if ($module['id'] === $moduleId) {
                            foreach ($module['lessons'] as &$lesson) {
                                if ($lesson['id'] === $lessonId) {
                                    $lesson['title'] = $_POST['lesson_title'];
                                    $lesson['duration'] = $_POST['lesson_duration'];

                                    // Update markdown content
                                    $markdownPath = $lesson['contentFile'];
                                    $markdownContent = $_POST['lesson_markdown'];

                                    if (saveMarkdownFile($markdownPath, $markdownContent)) {
                                        if (saveCourses($courses)) {
                                            echo json_encode(['status' => 'success']);
                                        } else {
                                            echo json_encode(['status' => 'error', 'message' => 'Could not save courses']);
                                        }
                                    } else {
                                        echo json_encode(['status' => 'error', 'message' => 'Could not save markdown']);
                                    }
                                    break 3;
                                }
                            }
                        }
                    }
                }
            }
            break;

        case 'delete_lesson':
            $courses = loadCourses();
            $courseId = $_POST['course_id'];
            $moduleId = $_POST['module_id'];
            $lessonId = $_POST['lesson_id'];

            foreach ($courses['courses'] as &$course) {
                if ($course['id'] === $courseId) {
                    foreach ($course['modules'] as &$module) {
                        if ($module['id'] === $moduleId) {
                            $lessonIndex = array_search($lessonId, array_column($module['lessons'], 'id'));

                            if ($lessonIndex !== false) {
                                $lesson = $module['lessons'][$lessonIndex];

                                // Delete markdown file
                                if (file_exists($lesson['contentFile'])) {
                                    deleteFile($lesson['contentFile']);
                                }

                                // Remove lesson from array
                                unset($module['lessons'][$lessonIndex]);
                                $module['lessons'] = array_values($module['lessons']);

                                if (saveCourses($courses)) {
                                    echo json_encode(['status' => 'success']);
                                } else {
                                    echo json_encode(['status' => 'error', 'message' => 'Could not save courses']);
                                }
                                break 3;
                            }
                        }
                    }
                }
            }
            break;
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Gerenciador de Cursos</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
</head>
<body class="bg-gray-100">
    <div id="app" class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6">Gerenciador de Cursos</h1>

        <div v-for="course in courses" :key="course.id" class="bg-white shadow-md rounded-lg p-6 mb-4">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold">{{ course.title }}</h2>
                <button @click="editCourse(course)" class="bg-blue-500 text-white px-4 py-2 rounded">Editar Curso</button>
            </div>

            <div v-for="module in course.modules" :key="module.id" class="mt-4 bg-gray-50 p-4 rounded">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-medium">{{ module.title }}</h3>
                    <button @click="editModule(course, module)" class="bg-green-500 text-white px-3 py-1 rounded">Editar Módulo</button>
                </div>

                <div class="mt-3">
                    <div v-for="lesson in module.lessons" :key="lesson.id" class="bg-white border p-3 rounded mb-2 flex justify-between items-center">
                        <div>
                            <span class="font-semibold">{{ lesson.title }}</span>
                            <span class="text-gray-500 ml-2">{{ lesson.duration }}</span>
                        </div>
                        <div>
                            <button @click="editLesson(course, module, lesson)" class="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
                            <button @click="deleteLesson(course, module, lesson)" class="bg-red-500 text-white px-3 py-1 rounded">Deletar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Structures -->
        <div v-if="modalType === 'course'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-1/2">
                <h2 class="text-2xl mb-4">Editar Curso</h2>
                <input v-model="editingItem.title" placeholder="Título do Curso" class="w-full p-2 border mb-2">
                <input v-model="editingItem.duration" placeholder="Duração" class="w-full p-2 border mb-2">
                <textarea v-model="editingItem.description" placeholder="Descrição" class="w-full p-2 border mb-4" rows="4"></textarea>
                <div class="flex justify-end">
                    <button @click="cancelEdit" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancelar</button>
                    <button @click="saveCourse" class="bg-blue-500 text-white px-4 py-2 rounded">Salvar</button>
                </div>
            </div>
        </div>

        <div v-if="modalType === 'module'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-1/2">
                <h2 class="text-2xl mb-4">Editar Módulo</h2>
                <input v-model="editingItem.title" placeholder="Título do Módulo" class="w-full p-2 border mb-4">
                <div class="flex justify-end">
                    <button @click="cancelEdit" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancelar</button>
                    <button @click="saveModule" class="bg-green-500 text-white px-4 py-2 rounded">Salvar</button>
                </div>
            </div>
        </div>

        <div v-if="modalType === 'lesson'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-3/4">
                <h2 class="text-2xl mb-4">Editar Aula</h2>
                <input v-model="editingItem.title" placeholder="Título da Aula" class="w-full p-2 border mb-2">
                <input v-model="editingItem.duration" placeholder="Duração" class="w-full p-2 border mb-2">
                <textarea v-model="lessonMarkdown" placeholder="Conteúdo da Aula (Markdown)" class="w-full p-2 border mb-4" rows="10"></textarea>
                <div class="flex justify-end">
                    <button @click="cancelEdit" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancelar</button>
                    <button @click="saveLesson" class="bg-yellow-500 text-white px-4 py-2 rounded">Salvar</button>
                </div>
            </div>
        </div>
    </div>

    <script>
    new Vue({
        el: '#app',
        data: {
            courses: <?php echo json_encode(loadCourses()['courses']); ?>,
            modalType: null,
            editingItem: {},
            currentCourse: null,
            currentModule: null,
            lessonMarkdown: ''
        },
        methods: {
            editCourse(course) {
                this.modalType = 'course';
                this.editingItem = { ...course };
                this.currentCourse = course;
            },
            editModule(course, module) {
                this.modalType = 'module';
                this.editingItem = { ...module };
                this.currentCourse = course;
                this.currentModule = module;
            },
            editLesson(course, module, lesson) {
                this.modalType = 'lesson';
                this.editingItem = { ...lesson };
                this.currentCourse = course;
                this.currentModule = module;

                // Load markdown content
                fetch(lesson.contentFile)
                    .then(response => response.text())
                    .then(text => {
                        this.lessonMarkdown = text;
                    });
            },
            cancelEdit() {
                this.modalType = null;
                this.editingItem = {};
                this.currentCourse = null;
                this.currentModule = null;
                this.lessonMarkdown = '';
            },
            saveCourse() {
                const formData = new FormData();
                formData.append('action', 'update_course');
                formData.append('course_id', this.currentCourse.id);
                formData.append('title', this.editingItem.title);
                formData.append('duration', this.editingItem.duration);
                formData.append('description', this.editingItem.description);

                fetch('', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        Object.assign(this.currentCourse, this.editingItem);
                        this.cancelEdit();
                    } else {
                        alert('Erro ao salvar curso');
                    }
                });
            },
            saveModule() {
                const formData = new FormData();
                formData.append('action', 'update_module');
                formData.append('course_id', this.currentCourse.id);
                formData.append('module_id', this.currentModule.id);
                formData.append('module_title', this.editingItem.title);

                fetch('', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        Object.assign(this.currentModule, { title: this.editingItem.title });
                        this.cancelEdit();
                    } else {
                        alert('Erro ao salvar módulo');
                    }
                });
            },
            saveLesson() {
                const formData = new FormData();
                formData.append('action', 'update_lesson');
                formData.append('course_id', this.currentCourse.id);
                formData.append('module_id', this.currentModule.id);
                formData.append('lesson_id', this.editingItem.id);
                formData.append('lesson_title', this.editingItem.title);
                formData.append('lesson_duration', this.editingItem.duration);
                formData.append('lesson_markdown', this.lessonMarkdown);

                fetch('', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        Object.assign(this.editingItem, {
                            title: this.editingItem.title,
                            duration: this.editingItem.duration
                                                                   });
                                                                   this.cancelEdit();
                                                               } else {
                                                                   alert('Erro ao salvar aula');
                                                               }
                                                           });
                                                       },
                                                       deleteLesson(course, module, lesson) {
                                                           if (confirm('Tem certeza que deseja deletar esta aula?')) {
                                                               const formData = new FormData();
                                                               formData.append('action', 'delete_lesson');
                                                               formData.append('course_id', course.id);
                                                               formData.append('module_id', module.id);
                                                               formData.append('lesson_id', lesson.id);

                                                               fetch('', {
                                                                   method: 'POST',
                                                                   body: formData
                                                               })
                                                               .then(response => response.json())
                                                               .then(data => {
                                                                   if (data.status === 'success') {
                                                                       // Remove lesson from the module
                                                                       const moduleIndex = course.modules.findIndex(m => m.id === module.id);
                                                                       const lessonIndex = course.modules[moduleIndex].lessons.findIndex(l => l.id === lesson.id);

                                                                       if (moduleIndex !== -1 && lessonIndex !== -1) {
                                                                           course.modules[moduleIndex].lessons.splice(lessonIndex, 1);
                                                                       }
                                                                   } else {
                                                                       alert('Erro ao deletar aula');
                                                                   }
                                                               });
                                                           }
                                                       }
                                                   }
                                               });
                                               </script>
                                           </body>
                                           </html>