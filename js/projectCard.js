import { Project } from './Project.js';
import { createProjectComponentYourSelfLikeMagic } from './createProjectComponentYourSelfLikeMagic.js';

class ProjectCard extends HTMLElement {
    constructor() {
        super();
        const projects = this.getProjects()
            .then((projects) => {
                for (let i = 0; i < projects.length; i++) {
                    const project = new Project(projects[i]);
                    if (project.isVisible) {
                        this.innerHTML += createProjectComponentYourSelfLikeMagic(project);
                    }
                }
            })
    }

    // Get my all projects from my backend API
    async getProjects() {
        let projects = [];
        projects = await fetch('http://18.231.162.74:3000/projects');

        const response = await projects.json();
        return response;
    }
}

window.customElements.define('project-card', ProjectCard);
