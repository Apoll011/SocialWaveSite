(function ($) {
    "use strict"; // Força um código mais seguro, evitando erros comuns

    // Inicializar o plugin WOW.js para animações quando elementos entram na tela
    new WOW().init();

    // $(".blablabla") == document.getElementById("blablabla")

    // Navbar "Sticky" (fixa no topo após o utilizador fazer scroll)
    $(window).scroll(function () { // Função roda toda vez que o user faz scroll
        if ($(this).scrollTop() > 300) { // Se o scroll passar dos 300px
            $('.sticky-top').css('top', '0px'); // Mostrar a navbar no topo
        } else {
            $('.sticky-top').css('top', '-100px'); // Esconder a navbar para cima
        }
    });

    // Menu Dropdown ao passar o rato (apenas em ecrãs maiores que 992px)
    const $dropdown = $(".dropdown"); // Seleciona os elementos dropdown
    const $dropdownToggle = $(".dropdown-toggle"); // Botão que ativa o dropdown
    const $dropdownMenu = $(".dropdown-menu"); // O menu suspenso
    const showClass = "show"; // Classe usada para mostrar o menu

    $(window).on("load resize", function() {
        // Se a largura da tela for maior ou igual a 992px
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
                function() {
                    // Quando o rato entra no dropdown
                    const $this = $(this);
                    $this.addClass(showClass); // Adiciona a classe "show"
                    $this.find($dropdownToggle).attr("aria-expanded", "true"); // Acessibilidade
                    $this.find($dropdownMenu).addClass(showClass); // Mostra o menu
                },
                function() {
                    // Quando o rato sai do dropdown
                    const $this = $(this);
                    $this.removeClass(showClass); // Remove a classe "show"
                    $this.find($dropdownToggle).attr("aria-expanded", "false"); // Acessibilidade
                    $this.find($dropdownMenu).removeClass(showClass); // Esconde o menu
                }
            );
        } else {
            // Se a tela for pequena, remover os eventos de hover para evitar bugs
            $dropdown.off("mouseenter mouseleave");
        }
    });

    // Botão "Voltar ao topo"
    $(window).scroll(function () {
        if ($(this).scrollTop() > 500) { // Se o scroll for maior que 500px
            $('.back-to-top').fadeIn('slow'); // Mostrar o botão
        } else {
            $('.back-to-top').fadeOut('slow'); // Esconder o botão
        }
    });

    // Quando o botão "Voltar ao topo" for clicado
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo'); // Animação suave para o topo
        return false; // Evita comportamento padrão do link
    });

    // Função para criar os carrosséis (sliders) na página
    function createCarousels() {
        // Carrossel do cabeçalho
        $(".header-carousel").owlCarousel({
            autoplay: true, // Reproduzir automaticamente
            smartSpeed: 1500, // Velocidade de transição
            items: 1, // Mostrar apenas um item de cada vez
            dots: true, // Mostrar os pontos de navegação
            loop: true, // Permitir loop infinito
            nav : true, // Mostrar setas de navegação
            navText : [
                '<i class="bi bi-chevron-left"></i>', // Ícone para a esquerda
                '<i class="bi bi-chevron-right"></i>' // Ícone para a direita
            ]
        });

        // Carrossel de testemunhos/clientes
        $(".testimonial-carousel").owlCarousel({
            autoplay: true, // Reprodução automática
            smartSpeed: 1000, // Velocidade de transição
            center: true, // Centraliza os itens
            margin: 24, // Espaçamento entre os itens
            dots: true, // Mostrar pontos de navegação
            loop: true, // Loop infinito
            nav : false, // Sem setas de navegação
            responsive: {
                0: { items: 1 }, // Em telas pequenas, mostrar 1 item
                768: { items: 2 }, // Em tablets, mostrar 2 itens
                992: { items: 3 } // Em desktops, mostrar 3 itens
            }
        });
    }
    createCarousels(); // Chama a função para iniciar os carrosséis

    // Expansão de perguntas frequentes (FAQ)
    document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
        faqItem.addEventListener('click', () => {
            faqItem.parentNode.classList.toggle('faq-active'); // Alterna a classe para expandir/recolher
        });
    });

    // Recarregar a página quando o utilizador usa o botão "Voltar" no navegador
    window.addEventListener('popstate', () => {
        location.reload(); // Atualiza a página ao voltar no histórico
    });

})(jQuery); // Passar jQuery como argumento para evitar conflitos
