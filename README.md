Assinatura Digital JavaScript
===========================
Baseado no projeto [JavaScript File Encryption App](http://tutorialzine.com/2013/11/javascript-file-encrypter/)

Demonstração [Demo](http://phelipealves.github.io/assinaturadigitaljavascript/)

* Motivação: portais que produzem informações sigilosas ou que exigem a assinatura digital de quem produz a informação em questão, podem se beneficiar do emprego de JavaScript para execução de tais operações e, desta forma, desobrigar a instalação de plug-in para a realização de tais operações.
* Usar recurso como jsrasign (http://kjur.github.io/jsrsasign/) ou equivalente pode ser empregado para este trabalho.
* Criar uma página por meio da qual se seleciona um documento e outras informações necessárias para que o documento seja assinado digitalmente.
* No sentido inverso, a página deverá, ao receber um documento assinado, verificar a assinatura do mesmo. 
* É possível e provável a interação com leitor de token contendo o certificado digital empregado para assinar o documento e, neste caso, devem ser observadas as recomendações do ICP-Brasil, se for o caso. Isto se aplica a padrões, dispositivos possíveis e outros.

============================
Passos da aplicação

*  Passo 1 
  * Assinatura Digital via JavaScript
  * Opções (Assinar um arquivo ou Verificar assinatura).
*	Passo 2 
  *	**(Assinar)** Escolha um arquivo para assinar.
	* **(Verificar)** Escolha um arquivo verificar a assinatura.
	* **(Assinar e Verificar)** Ler esse arquivo e converter os Bytes em String.
* Passo 3 
	* **(Assinar)** Insira a chave privada
	* **(Verificar)** Insira a chave pública
	  * Poderá ser inserida a chave Pública no campo de texto.
	* **(Assinar e Verificar)** Poderá ser selecionada as chaves padrões do sistema, salvas em arquivos locais. Simulando uma leitura de um cartão, pen drive ou discos com assinatura de hardware.
	* **(Para esse item deve ser observado que a iteração do javascript com o hardware depende de outras aplicações rodando no computador do cliente para a leitura da chave privada. Uma solução possível seria a criação de uma aplicação nativa no cliente que se comunicasse com os dispositivos e disponibilizasse uma porta de acesso para o javascript ex:localhost:2406, sendo que cada vez que fosse realizado uma requisição nessa porta pelo javascript, essa aplicação iria realizar a leitura dos dispositivos e retornar a string contendo a chave).**
	
* Passo 4 
  * **(Assinar)** Selecione o algoritmo de assinatura ( SHA1, SHA256, SHA512, MD5, RIPEMD-160 ).
	  * Assina o arquivo e cria o link para baixar o arquivo com a assinatura.
	* **(Verificar)** Selecione o arquivo com assinatura
* Passo 5
  * **(Assinar)** Download do arquivo com a assinatura.
  * **(Verificar)** Status da verificação
    * _"Assinatura válida!"_.
    * _"Assinatura inválida!"_.

