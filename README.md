# SocialWave

## Sobre o Projeto

A SocialWave é uma plataforma educativa inovadora que tem como missão capacitar jovens e adolescentes a utilizarem as redes sociais de forma equilibrada, segura e responsável. Através de uma combinação de cursos interativos, materiais educativos e recursos de aprendizagem, a SocialWave ajuda os utilizadores a transformar as suas experiências nas redes sociais em oportunidades de crescimento pessoal e académico.

## 🚀 Funcionalidades

- **Cursos estruturados**: Conteúdo educativo organizado em módulos claros e objetivos
- **Aprendizagem remota**: Acesso a todos os conteúdos a partir de qualquer local
- **Assistente AI**: Dolphy, o nosso assistente virtual, pronto para responder a dúvidas a qualquer momento
- **Galeria de recursos**: Materiais complementares para aprofundar conhecimentos
- **Planos adaptáveis**: Diferentes níveis de acesso adequados a cada fase de aprendizagem

## 📋 Estrutura do Projeto

```
socialwave/
├── index.html               # Página principal do site
├── about.html               # Página "Sobre Nós"
├── courses.html             # Página com a lista de cursos disponíveis
├── gallery.html             # Galeria de recursos
├── timeline.html            # Linha do tempo do projeto
├── contact.html             # Página de contacto
├── courses/                 # Diretório de cursos
│   ├── course.html          # Template de exibição de curso
│   ├── c/                   # Conteúdo dos cursos
│       └── courses.json     # Dados dos cursos em formato JSON
├── css/                     # Folhas de estilo
│   ├── style.css            # Estilos principais
│   ├── bootstrap.min.css    # Framework Bootstrap
│   └── ...
├── js/                      # Scripts JavaScript
│   ├── main.js              # Funções principais
│   ├── courses.js           # Gestão de cursos
│   ├── pet.js               # Funcionalidades do assistente virtual
│   └── ...
├── img/                     # Imagens e recursos visuais
└── lib/                     # Bibliotecas externas
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura base do site
- **CSS3**: Estilização e responsividade
- **JavaScript**: Interatividade e funcionalidades dinâmicas
- **Bootstrap**: Framework para design responsivo
- **jQuery**: Biblioteca para manipulação de DOM
- **Owl Carousel**: Para carrosséis interativos
- **Marked.js**: Para renderização de conteúdo em Markdown
- **Font Awesome**: Ícones utilizados no site

## 🔧 Instalação e Configuração

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/socialwave.git
   ```

2. Aceda à pasta do projeto:
   ```bash
   cd socialwave
   ```

3. Abra o ficheiro `index.html` no seu navegador ou configure um servidor local.

Para desenvolvimento, recomenda-se a utilização de um servidor local como o Live Server (extensão do VSCode) ou o servidor integrado do Python:

```bash
python -m http.server
```

## 📚 Organização de Cursos

Os cursos estão organizados em `courses.json`, um ficheiro que contém todos os detalhes dos cursos disponíveis:

```javascript
{
  "courses": {
    "curso-id": {
      "title": "Título do Curso",
      "description": "Descrição do curso",
      "duration": "Duração",
      "totalLessons": 10,
      "coverImage": "/img/curso-imagem.jpg",
      "modules": [
        {
          "id": "modulo-1",
          "title": "Título do Módulo",
          "lessons": [
            {
              "title": "Título da Lição",
              "contentFile": "/path/to/lesson.md",
              "duration": "10 minutos",
              "active": true
            }
          ]
        }
      ]
    }
  }
}
```

## 🎯 Missão e Visão

### Missão
Oferecer serviços educativos sobre as redes sociais para jovens e adolescentes, facilitando o equilíbrio entre estudos e redes sociais, disponibilizando conteúdo relevante que demonstre como as redes sociais podem ser utilizadas de forma construtiva nos estudos.

### Visão
Estabelecer uma presença sólida nas redes sociais, envolvendo jovens e adolescentes de maneira significativa. Tornar a SocialWave uma referência no auxílio aos jovens na navegação segura e produtiva das redes sociais, transformando-se numa plataforma essencial para a educação digital do público jovem.

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para a sua funcionalidade:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. Commit as suas alterações:
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. Push para a branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. Abra um Pull Request

## 📝 Planos de Assinatura

A SocialWave oferece diferentes planos de assinatura para atender às necessidades de cada utilizador:

### Plano Básico - "Iniciante Digital"
- Acesso a 5 cursos
- Guias práticos de boas práticas nas redes sociais
- Suporte básico via chatbot

### Plano Intermediário - "Influencer Consciente"
- Acesso a todos os cursos básicos e intermediários
- Workshops sobre branding e estratégias de conteúdo
- Acompanhamento por especialistas em redes sociais
- Suporte prioritário via chatbot e e-mail

### Plano Avançado - "Mestre das Redes"
- Acesso a todos os cursos (básicos, intermediários e avançados)
- Consultoria individual com especialistas em marketing digital
- Análise de desempenho e relatórios personalizados
- Acesso antecipado a novos conteúdos e funcionalidades

---

&copy; SocialWave, todos os direitos reservados.
