'use strict';
document.addEventListener('DOMContentLoaded', function() {
    var botaoInscrever = document.querySelector('.modal-cadastro');
    var botaoEntrar = document.querySelector('.modal-login');
    var quadrado = document.getElementById('quadrado');
    var modalCadastro = document.getElementById('modal-cadastro');
    var modalLogin = document.getElementById('modal-login');
    var botaoFechar = document.querySelector('.close');

    function mostrarModal(modalId) {
        // Esconde todos os modais
        modalCadastro.style.display = 'none';
        modalLogin.style.display = 'none';

        // Mostra o modal especificado
        document.getElementById(modalId).style.display = 'block';

        // Mostra o quadrado
        quadrado.style.display = 'block';
    }

    function fecharQuadrado() {
        // Esconde o quadrado
        quadrado.style.display = 'none';
    }

    botaoInscrever.addEventListener('click', function() {
        mostrarModal('modal-cadastro');
    });

    botaoEntrar.addEventListener('click', function() {
        mostrarModal('modal-login');
    });

    var botoesFechar = document.querySelectorAll('.close');

    // Função para fechar o modal
    function fecharModal() {
        // Esconde o quadrado
        quadrado.style.display = 'none';
    }

    // Adiciona ouvintes de eventos a todos os botões de fechar
    botoesFechar.forEach(function(botao) {
        botao.addEventListener('click', fecharModal);
    });


    function scrollToNextSection() {
        var nextSection = document.querySelector('.container-red'); // Selecione a próxima seção
        nextSection.scrollIntoView({ behavior: 'smooth' }); // Role suavemente até a próxima seção
    }

    // Adiciona um evento de clique à opção "Role para baixo para saber mais"
    var mensagemDescer = document.getElementById('mensagem-descer');
    mensagemDescer.addEventListener('click', scrollToNextSection);

    

    
    var formCadastro = document.getElementById('cadastro');
    var formLogin = document.getElementById('login');

    formCadastro.addEventListener('submit', function(event) {
        event.preventDefault();
        var email = document.querySelector('#modal-cadastro #email').value; // Seleciona o campo de e-mail dentro do modal de cadastro
        var senha = document.querySelector('#modal-cadastro #senha').value; // Seleciona o campo de senha dentro do modal de cadastro

        fetch('/inscrever', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: senha }),
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });

        // Fecha o quadrado após o envio do formulário
        fecharQuadrado();

    })

    formLogin.addEventListener('submit', function(event) { // Adiciona ouvinte de evento ao formulário de login
        event.preventDefault();
        var email = document.querySelector('#modal-login #email').value; // Seleciona o campo de e-mail dentro do modal de login
        var senha = document.querySelector('#modal-login #senha').value; // Seleciona o campo de senha dentro do modal de login

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: senha }),
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });

        // Fecha o quadrado após o envio do formulário
        fecharQuadrado();
    });
});

//limpar caixa de texto
document.addEventListener('DOMContentLoaded', function() {
    var clearButton = document.getElementById('clearButton');

    clearButton.addEventListener('click', function() {
        var textAreas = document.querySelectorAll('.custom-textarea');
        textAreas.forEach(function(textArea) {
            textArea.value = ''; // Limpa o conteúdo da caixa de texto
        });
    });
});




var card = document.getElementById('card');
var cardInner = card.querySelector('.flip-card-inner');
var swipeLeft = document.getElementById('swipeLeft');
var swipeRight = document.getElementById('swipeRight');

swipeLeft.addEventListener('click', function(event) {
    event.stopPropagation();
    var moveOutWidth = document.body.clientWidth;
    cardInner.style.transform = 'translate(-' + moveOutWidth + 'px) rotateY(0deg)';
    setTimeout(function() {
        card.remove();
        fetchNotesAndAddCards();
        
    }, 300);
});

swipeRight.addEventListener('click', function(event) {
    event.stopPropagation();
    var moveOutWidth = document.body.clientWidth ;
    cardInner.style.transform = 'translate(' + moveOutWidth + 'px) rotateY(0deg)';
    setTimeout(function() {
        card.remove();
        fetchNotesAndAddCards();
        
    }, 300);
});



card.addEventListener('click', function() {
    if (cardInner.style.transform === 'rotateY(180deg)') {
        cardInner.style.transform = 'rotateY(0deg)';
    } else {
        cardInner.style.transform = 'rotateY(180deg)';
    }
});


async function updatePriority(direction, data, card, i) {

    if (!card) {
        console.error('Card indefinido em updatePriority');
        return;
    }

    var currentPriority = data[i].priority;
    if (isNaN(currentPriority)) {
        console.error('Prioridade atual inválida');
        return;
    }

    var noteId = data[i].id;
    var newPriority = (direction === 'left') ? currentPriority + 1 : currentPriority - 1;
    var userId = localStorage.getItem('userId');
    
    if (!userId || !noteId) {
        console.error('Erro: userId ou noteId não encontrado');
        return;
    }

    // Atualiza a prioridade no objeto data[i]
    data[i].priority = newPriority;

    var data2 = {
        messageBack: data[i].messageBack,
        messageFront: data[i].messageFront,
        titleFront: data[i].titleFront,
        priority: data[i].priority,
        titleBack: data[i].titleBack,
    };


    var url = 'http://localhost:8080/users/' + userId + '/notes/' + noteId;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data2), // Envie apenas os dados atualizados da nota
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar a prioridade');
        }



    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}





function addNewCard(data, titleFront, messageFront, titleBack, messageBack, i, length, ATUALIZADO) {
    // Chama a função para atualizar os dados apenas se ATUALIZADO for falso
    if (ATUALIZADO === false) {
        var userId = localStorage.getItem('userId');

        // Verificar se o userId foi obtido corretamente
        if (!userId) {
            console.error('Erro: userId não encontrado no localStorage');
            return;
        }

        // Construir a URL com o userId
        var url = 'http://localhost:8080/users/' + userId + '/notes';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados');
                }
                return response.json();
            })
            .then(updatedData => {
                // Atualiza os dados
                data = updatedData;
                length = data.length;

                
                // Agora você pode chamar addNewCard ou fazer qualquer outra coisa com os dados atualizados
            })
            .catch(error => {
                console.error('Erro:', error);
            });
    }
    // Você ainda pode acessar a variável data aqui fora do bloco if


  
    var newCard = document.createElement('div');
    newCard.classList.add('flip-card');
    newCard.innerHTML = `
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <h1>${titleFront}</h1>
                <p>${messageFront}</p>
                <div class="tinder--buttons">
                    <button class="swipeLeft" style="background-color: red;"><i class="fa fa-arrow-left"></i></button>
                    <button class="swipeRight" style="background-color: green;"><i class="fa fa-arrow-right"></i></button>
                </div>
            </div>
            <div class="flip-card-back">
                <h1>${titleBack}</h1>
                <p>${messageBack}</p>
            </div>
        </div>
    `;
    document.querySelector('.flip-background-oi').append(newCard);

    var newCardInner = newCard.querySelector('.flip-card-inner');
    var newSwipeLeft = newCard.querySelector('.swipeLeft');
    var newSwipeRight = newCard.querySelector('.swipeRight');

    newSwipeLeft.addEventListener('click', function(event) {
        event.stopPropagation();
        console.log(data[i].id);
        updatePriority('left', data,data[i].id,i);
        var moveOutWidth = document.body.clientWidth;
        newCardInner.style.transform = 'translate(-' + moveOutWidth + 'px) rotateY(0deg)';
        setTimeout(function() {
            newCard.remove();
            i = (i + 1) % length;
            addNewCard(data,data[i].titleFront, data[i].messageFront, data[i].titleBack, data[i].messageBack, i, length, false);
        }, 300);
    });

    newSwipeRight.addEventListener('click', function(event) {
        event.stopPropagation();
        updatePriority('right',data,data[i].id,i);
        var moveOutWidth = document.body.clientWidth;
        newCardInner.style.transform = 'translate(' + moveOutWidth + 'px) rotateY(0deg)';
        setTimeout(function() {
            newCard.remove();
            i = (i + 1) % length;
            addNewCard(data,data[i].titleFront, data[i].messageFront, data[i].titleBack, data[i].messageBack, i, length, false);
        }, 300);
    });

    newCard.addEventListener('click', function() {
        if (newCardInner.style.transform === 'rotateY(180deg)') {
            newCardInner.style.transform = 'rotateY(0deg)';
        } else {
            newCardInner.style.transform = 'rotateY(180deg)';
        }
    });

    setTimeout(function() {
        newCard.style.opacity = '1';
        newCard.style.transform = 'translateY(0)';
    }, 50);
}

function setCards(data, i, length) {
   addNewCard(data,data[i].titleFront, data[i].messageFront, data[i].titleBack, data[i].messageBack, i, length,true);
    
}

    function fetchNotesAndAddCards() {
        var userId = localStorage.getItem('userId');

        // Verificar se o userId foi obtido corretamente
        if (!userId) {
            console.error('Erro: userId não encontrado no localStorage');
            return;
        }

        // Construir a URL com o userId
        var url = 'http://localhost:8080/users/' + userId + '/notes';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados');
                }
                return response.json();
            })
            .then(data => {
                var length = data.length;
                setCards(data, 0, length);
            })
            .catch(error => {
                console.error('Erro:', error);
            });
    }

    async function fetchNewData() {
        try {
            var userId = localStorage.getItem('userId');

            // Verificar se o userId foi obtido corretamente
            if (!userId) {
                console.error('Erro: userId não encontrado no localStorage');
                return;
            }
    
            // Construir a URL com o userId
            var url = 'http://localhost:8080/users/' + userId + '/notes';
            
            const response = await fetch(url);
            console.log(response);
            if (!response.ok) {
                throw new Error('Erro ao obter a nova data');
            }
            const newData = await response.json();
            return newData;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    function fetchDataAndUpdate() {
        fetchNewData()
            .then(newData => {
                if (newData) {
                    data = newData;
                    console.log('Dados atualizados:', data);
                } else {
                    console.log('Não foi possível obter os dados atualizados.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar os dados:', error);
            });
    }
    



   document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.submit-button').addEventListener('click', function() {
        var TitluloFrente = document.getElementById('titleFront').value;
        var MensagemFrente = document.getElementById('messageFront').value;
        var TituloTras = document.getElementById('titleBack').value;
        var MensagemTras = document.getElementById('messageBack').value;
        
        

        if (titleFront === '') {
            alert('Por favor, preencha todos os campos.');
            return;     
        }
        var data = {
            titleFront: TitluloFrente,
            messageFront: MensagemFrente,
            titleBack: TituloTras,
            messageBack: MensagemTras,
            priority: localStorage.getItem('selectedNumber')
        };
        
        var userId = localStorage.getItem('userId');

        // Verificar se o userId foi obtido corretamente
        if (!userId) {
            console.error('Erro: userId não encontrado no localStorage');
            return;
        }

        // Construir a URL com o userId
        var url = 'http://localhost:8080/users/' + userId + '/notes';
        

        fetch(url, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar os dados');
            }
            document.getElementById('mensagem').style.display = 'block';
            console.log('Dados enviados com sucesso');
            var textAreas = document.querySelectorAll('.custom-textarea');
            textAreas.forEach(function(textArea) {
                textArea.value = ''; // Limpa o conteúdo da caixa de texto
            });
            setTimeout(function() {
                document.getElementById('mensagem').style.display = 'none'; // Oculta a mensagem após 5 segundos
            }, 5000);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    });
});


document.getElementById('DeleteButton').addEventListener('click', function() {
    window.location.href = 'deletion.html'; // Redireciona para oi.html ao clicar no botão "Voltar"
});

    