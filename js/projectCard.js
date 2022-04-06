
class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <link rel="stylesheet" href="../css/project-component-style.css" type="text/css"></link>
        <div class="card column space-inside">
            <div class="card-header row space-inside">
                <div>
                    <span class="fa-solid fa-diagram-project fa-xl"></span>
                </div>
                <div>
                    <span class="tooltip">
                        <span class="tooltip-message">
                            Check out this project on my GitHub
                        </span>
                        <i class="space-inside fa-brands fa-github fa-2xl"></i>
                    </span>

                    <span class="tooltip">
                        <span class="tooltip-message">
                            Check out this project Live
                        </span>
                        <i class="space-inside fa-solid fa-arrow-up-right-from-square fa-2xl"></i>
                    </span>
                    
                </div>
            </div>
            <div class="card-content column space-inside">
                <div class="card-title space-inside">Titulo</div>
                <div class="card-description space-inside">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ratione, distinctio facilis natus quis fugiat non temporibus laborum, ducimus, minima saepe voluptas? Optio, quibusdam maiores. Nam explicabo quae voluptate quo!</div>
            </div>
            <div class="card-footer space-inside">
                <span class="iten-footer fa-brands fa-github fa-2xl"></span>
                <span class="iten-footer fa-brands fa-github fa-2xl"></span>
                <span class="iten-footer fa-brands fa-github fa-2xl"></span>
                <span class="iten-footer fa-brands fa-github fa-2xl"></span>
            </div>
        </div>`;

    }
}
window.customElements.define('project-card', ProjectCard);