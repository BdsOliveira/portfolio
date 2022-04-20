export function createProjectComponentYourSelfLikeMagic(project) {
    return `
    <link rel="stylesheet" href="../css/project-component-style.css" type="text/css"></link>
    <div class="card column space-inside" id="${project.id}">
        <div class="card-header row space-inside">
            <div>
                <span class="fa-solid fa-diagram-project fa-xl"></span>
            </div>
            <div>
                <span class="tooltip">
                    <span class="tooltip-message">
                        Check out this project on my GitHub
                    </span>
                    <a class="gitHubLink" href="${project.gitHubLink}" target="_blank">
                        <i class="space-inside fa-brands fa-github fa-2xl"></i>
                    </a>
                </span>

                <span class="tooltip">
                    <span class="tooltip-message">
                        Check out this project Live
                    </span>
                    <a class="liveLink" href="${project.liveLink}" target="_blank">
                        <i class="space-inside fa-solid fa-arrow-up-right-from-square fa-2xl"></i>
                    </a>
                </span>
                
            </div>
        </div>
        <div class="card-content column space-inside">
            <div class="card-title space-inside">${project.title}</div>
            <div class="card-description space-inside">${project.description}</div>
        </div>
        <div class="card-footer space-inside">
            <span class="iten-footer iten-footer1">${project.skillUsed1}</span>
            <span class="iten-footer iten-footer2">${project.skillUsed2}</span>
            <span class="iten-footer iten-footer3">${project.skillUsed3}</span>
            <span class="iten-footer iten-footer4">${project.skillUsed4}</span>
            <span class="iten-footer iten-footer5">${project.skillUsed5}</span>
        </div>
    </div>
    `;
}