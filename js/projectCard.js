
class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <div class="card column border">
            <div class="card-header row border">
                <div>
                    Icon
                </div>
                <div>
                    <i class="fa-brands fa-github fa-2xl"></i>
                    <i class="fa-brands fa-linkedin fa-2xl"></i>
                </div>
            </div>
            <div class="card-content column border">
                <div class="card-title border">Titulo</div>
                <div class="card-description border">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ratione, distinctio facilis natus quis fugiat non temporibus laborum, ducimus, minima saepe voluptas? Optio, quibusdam maiores. Nam explicabo quae voluptate quo!</div>
            </div>
            <div class="card-footer border">
                <i class="fa-brands fa-github fa-2xl"></i>
                <i class="fa-brands fa-github fa-2xl"></i>
                <i class="fa-brands fa-github fa-2xl"></i>
            </div>
        </div>`;

    }
}
window.customElements.define('project-card', ProjectCard);