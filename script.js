// Cole aqui a URL do seu Web App do Google copiada no Passo 2
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyVO3yQ0OEtHcu3ysCeQIyQKDvqY7iVCijSnkc3S5Y/dev";

// =========================================================================
// O RESTANTE DO SCRIPT ABAIXO NÃO PRECISA SER ALTERADO
// =========================================================================

// Armazenamento global dos dados dos GTs
let workGroupsData = {};
let selectedGroupName = null;

// Elementos da UI
const stepGroupSelection = document.getElementById('step-group-selection');
const stepConfirmation = document.getElementById('step-confirmation');
const stepQuestions = document.getElementById('step-questions');
const successMessage = document.getElementById('success-message');
const loader = document.getElementById('loader');

const groupSelect = document.getElementById('group-select');
const selectedGroupNameSpan = document.getElementById('selected-group-name');
const memberList = document.getElementById('member-list');
const questionsForm = document.getElementById('questions-form');

// Botões
const confirmButton = document.getElementById('confirm-button');
const backToSelectionButton = document.getElementById('back-to-selection-button');
const backToConfirmButton = document.getElementById('back-to-confirm-button');
const submitButton = document.getElementById('submit-button');

function showLoader(isSubmitting = false) {
    if (isSubmitting) {
        loader.innerHTML = '<div class="spinner"></div>';
        loader.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    } else {
        // Para o loader inicial, podemos manter o vídeo ou usar o spinner
        loader.innerHTML = '<div class="spinner"></div>';
        loader.style.backgroundColor = '#f4f4f5';
    }
    loader.style.opacity = '1';
    loader.style.display = 'flex';
}

function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
}

// Função para popular o select com os GTs
function populateGroups(groups) {
    workGroupsData = groups;
    groupSelect.innerHTML = '<option value="" disabled selected>Escolha seu GT...</option>';

    if(groups.error) {
        alert("Erro ao carregar os grupos: " + groups.error);
        groupSelect.innerHTML = '<option value="" disabled selected>Erro ao carregar dados</option>';
        return;
    }

    const sortedGroupNames = Object.keys(groups).sort();
    sortedGroupNames.forEach(groupName => {
        const option = document.createElement('option');
        option.value = groupName;
        option.textContent = groupName;
        groupSelect.appendChild(option);
    });
}

// Evento: Selecionar um GT
groupSelect.addEventListener('change', (e) => {
    selectedGroupName = e.target.value;
    if (!selectedGroupName) return;

    const groupData = workGroupsData[selectedGroupName];
    if (groupData) {
        selectedGroupNameSpan.textContent = selectedGroupName;
        memberList.innerHTML = ''; // Limpa a lista anterior
        groupData.members.forEach(member => {
            const li = document.createElement('li');
            li.textContent = member;
            memberList.appendChild(li);
        });
        
        stepGroupSelection.style.display = 'none';
        stepConfirmation.style.display = 'block';
    }
});

// Evento: Clicar em "Confirmar e Prosseguir"
confirmButton.addEventListener('click', () => {
    stepConfirmation.style.display = 'none';
    stepQuestions.style.display = 'block';
});

// Evento: Clicar em "Voltar" (da tela de confirmação)
backToSelectionButton.addEventListener('click', () => {
    stepConfirmation.style.display = 'none';
    stepGroupSelection.style.display = 'block';
    groupSelect.value = "";
});

// Evento: Clicar em "Voltar" (da tela de perguntas)
backToConfirmButton.addEventListener('click', () => {
    stepQuestions.style.display = 'none';
    stepConfirmation.style.display = 'block';
});

// Evento: Enviar o formulário de perguntas
questionsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const answers = [];
    const questionBlocks = document.querySelectorAll('.question-block');

    for (let i = 1; i <= questionBlocks.length; i++) {
        const questionBlock = questionBlocks[i - 1];
        const questionTitle = questionBlock.querySelector('h3').textContent;
        const responseInput = document.querySelector(`input[name="q${i}"]:checked`);
        const comment = document.querySelector(`textarea[name="c${i}"]`).value.trim();

        if (!responseInput) {
            alert(`Por favor, responda à Pergunta ${i}.`);
            return;
        }
        
        answers.push({
            questionTitle: questionTitle,
            response: responseInput.value,
            comment: comment
        });
    }
    
    showLoader(true);
    submitButton.disabled = true;

    const submissionData = {
        group: selectedGroupName,
        answers: answers
    };
    
    // USANDO FETCH PARA ENVIAR OS DADOS (MÉTODO POST)
    fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            onSaveSuccess(data);
        } else {
            onSaveFailure(data);
        }
    })
    .catch(error => {
        onSaveFailure({ message: error.toString() });
    });
});
    
function onSaveSuccess(response) {
    hideLoader();
    submitButton.disabled = false;
    stepQuestions.style.display = 'none';
    successMessage.style.display = 'block';
}

function onSaveFailure(error) {
    hideLoader();
    submitButton.disabled = false;
    alert('Ocorreu um erro ao enviar suas respostas: ' + error.message);
}
    
// Função que inicia tudo
document.addEventListener('DOMContentLoaded', () => {
    showLoader();
    
    // USANDO FETCH PARA BUSCAR OS DADOS (MÉTODO GET)
    fetch(GAS_API_URL)
        .then(response => response.json())
        .then(data => {
            populateGroups(data);
            hideLoader();
        })
        .catch(error => {
            alert("Falha ao carregar os dados. Por favor, recarregue a página.");
            console.error(error);
            hideLoader();
        });

});


