class Project {
    constructor(){
        this.gitHubLink = "https://github.com/BdsOliveira/portfolio";
        this.liveLink = "https://portfolio-bdsoliveira.vercel.app/";
        this.projectTitle = "Meu Portfolio";
        this.projectDescription = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ratione, distinctio facilis natus quis fugiat non temporibus laborum, ducimus, minima saepe voluptas? Optio, quibusdam maiores. Nam explicabo quae voluptate quo!";
        this.skillUsed1 = "HTML5";
        this.skillUsed2 = "CSS3";
        this.skillUsed3 = "Javascript";
        this.skillUsed4 = "";
        this.isVisible = true;
    }
}

class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = createComponentYourSelfLikeMagic();

        const project = new Project();

        if (project.isVisible) {
            this.querySelector(".gitHubLink").setAttribute("href", project.gitHubLink);
            this.querySelector(".liveLink").setAttribute("href", project.liveLink);
            this.querySelector(".card-title").innerHTML = project.projectTitle;
            this.querySelector(".card-description").innerHTML = project.projectDescription;
            this.querySelector(".iten-footer1").innerHTML = project.skillUsed1;
            this.querySelector(".iten-footer2").innerHTML = project.skillUsed2;
            this.querySelector(".iten-footer3").innerHTML = project.skillUsed3;
            this.querySelector(".iten-footer4").innerHTML = project.skillUsed4;
        }
    }
}


function createComponentYourSelfLikeMagic(){
    return `
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
                    <a class="gitHubLink" target="_blank">
                        <i class="space-inside fa-brands fa-github fa-2xl"></i>
                    </a>
                </span>

                <span class="tooltip">
                    <span class="tooltip-message">
                        Check out this project Live
                    </span>
                    <a class="liveLink" target="_blank">
                        <i class="space-inside fa-solid fa-arrow-up-right-from-square fa-2xl"></i>
                    </a>
                </span>
                
            </div>
        </div>
        <div class="card-content column space-inside">
            <div class="card-title space-inside"></div>
            <div class="card-description space-inside"></div>
        </div>
        <div class="card-footer space-inside">
            <span class="iten-footer iten-footer1"></span>
            <span class="iten-footer iten-footer2"></span>
            <span class="iten-footer iten-footer3"></span>
            <span class="iten-footer iten-footer4"></span>
        </div>
    </div>
    `;
}

window.customElements.define('project-card', ProjectCard);