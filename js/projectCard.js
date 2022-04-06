import { Project } from './Project.js';
import { createProjectComponentYourSelfLikeMagic } from './createProjectComponentYourSelfLikeMagic.js';

class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = createProjectComponentYourSelfLikeMagic();

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


window.customElements.define('project-card', ProjectCard);