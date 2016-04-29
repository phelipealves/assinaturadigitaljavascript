$(function(){

	var body = $('body'),
		stage = $('#stage'),
		back = $('a.back');

	// arquivo selecionado
	var _file = null;

	// arquivo em base-64
	var _text_file = "";

	// Chave privada
	var _privateKey = "";

	// Chave pública
	var _publicKey;
	$('#pubkey').val(loadingPublicKeyStandard());

	// Assinatura do arquivo
	var _signature = "";

	// Conteúdo do arquivo de assinatura
	var _text_signature = "";

	/* 	Passo 1 

		* Assinatura Digital via JavaScript
	*/

	$('#step1 .encrypt').click(function(){
		body.attr('class', 'encrypt');
		// ir para o passo 2
		step(2);
	});

	$('#step1 .decrypt').click(function(){
		body.attr('class', 'decrypt');
		step(2);
	});


	/* 	Passo 2 

		* Escolha um arquivo para assinar
		* Escolha um arquivo verificar a assinatura
		-- Ler esse arquivo e converter os Bytes em String
	*/	

	$('#step2 .button').click(function(){
		$(this).parent().find('input').click();
	});

	// Eventos de seleção do arquivo

	//******** Assinar ********

	$('#step2').on('change', '#encrypt-input', function(e){
		if(fileReadAsBinaryString(e)){
			step(3);
		}
	});

	//******** Verificar ********

	$('#step2').on('change', '#decrypt-input', function(e){
		if(fileReadAsBinaryString(e)){
			step(3);
		}
	});

	/*
		Lendo o arquivo e convertendo os Bytes em uma String para ser utilizada na assinatura
	*/
	function fileReadAsBinaryString(e){
		// Verifica se um arquivo foi selecionado
		if(e.target.files.length!=1){
			alert('Selecione um arquivo para assinar!');
			return false;
		}

		_file = e.target.files[0];
		// Arquivo deve conter no máximo 1mb
		if(_file.size > 1024*1024){
			alert('Selecione um arquivo de no máximo 1mb');
			return false;
		}

		// Lendo o arquivo em Base64
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            // O método btoa() codifica em base-64.
            _text_file = btoa(binaryString);
        };

        reader.readAsBinaryString(_file);

        return true;
	}

	/* Passo 3 

		* Insira a chave privada
		* Insira a chave pública
		-- Poderá ser selecionada as chaves padrões do sistema, salvas em arquivos locais. Simulando uma leitura de um cartão, pan drive ou discos com assinatura de hardware. 
		(Para esse item deve ser observado que a iteração do javascript com o hardware depende de outras aplicações rodando no computador do cliente para a leitura da chave privada. Uma solução possível seria a criação de uma aplicação nativa no cliente que se comunicasse com os dispositivos e disponibilitasse um porta de acesso passa o javascript ex:localhost:2406, sendo que cada vez que fosse realizado uma requisição nessa porta pelo javascript essa aplicação iria realizar a leitura dos dispositivos e retornar a string contendo a chave).
		-- Poderá ser inserida as chaves Privada e Pública nos campos de texto.
	*/	

	//******** Assinar ********

	$('#step3 .cardreader').click(function(){
		if(loadingPrivateKeyStandard()){
			step(4);
		}
		else{
			alert("Tente novamente a leitura do cartão");
		}

	});

	//******** Verificar ********

	$('#step3 .continue').click(function(){
		// Chave pública inserida pelo usuário no campo de texto
		var tempKey = $('#pubkey').val();
		if(tempKey.length > 0){
			_publicKey = $('#pubkey').val();	
			step(4);
		}else{
			alert("Insira a chave pública");			
		}		
	});

	

	/* Passo 4 
		* Selecione o algoritmo de assinatura ( SHA1, SHA256, SHA512, MD5, RIPEMD-160 ).
			-- Assina o arquivo e cria o link para baixar o arquivo com a assinatura.
		* Insira a assinatura para verificação
	*/

	//******** Assinar ********

	$('#step4 a.button.sign').click(function(){
		createSignatureFile();
		step(5);
	});

	/*
		Cria assinatura do arquivo e insere o link para download da assinatura.
	*/
	function createSignatureFile(){
		// Criando assinatura do arquivo
		var rsa = new RSAKey();
		rsa.readPrivateKeyFromPEMString(_privateKey);

		var hashAlg = $("#algorithm").val();
		var hSig = rsa.signString(_text_file, hashAlg);
		_signature = linebrk(hSig, 64);

		// Inserindo o link para download do arquivo da assinatura
		var a = $('#step5 a.download');
		a.attr('href', 'data:application/octet-stream,' + _signature);
		a.attr('download', _file.name + '.txt');	
	}

	//******** Verificar ********

	$('#step4 .browse').click(function(){
		$(this).parent().find('input').click();
	});

	$('#step4').on('change', '#signature-input', function(e){
		fileSignatureString(e);
	});	

	/*
		Lendo o arquivo de assinatura
	*/
	function fileSignatureString(e){
		// Verifica se um arquivo foi selecionado
		if(e.target.files.length!=1){
			alert('Selecione um arquivo para assinar!');
			return false;
		}

		file = e.target.files[0];
		var textType = /text.*/;

		if (file.type.match(textType)) {

			// Lendo o arquivo
	        var reader = new FileReader();
	        reader.onload = function(e) {
	           _text_signature = reader.result;
	           var status = verifySignatureFile();
	           signatureStatus(status);
	        };

	        reader.readAsText(file);
    	}
    	else{
    		alert('Selecione um arquivo de assinatura válido!');
    		return false;
    	}

        return true;
	}

	/* 
		Verifando assinatura do arquivo
	*/
	function verifySignatureFile(){
		//Assinatura para ser verificada
		_signature = _text_signature;

		// Verificando assinatura
		var x509 = new X509();
		try{
			x509.readCertPEM(_publicKey);
			var verification = x509.subjectPublicKeyRSA.verifyString(_text_file, _signature);
			return verification;
		}
		catch(e){
			console.log(e);
			return false;
		}
		console.log("signature");	
	}

	/*
		Mostrar o status da verificação da assinatura no passo 5
	*/
	function signatureStatus(isValid){

		if(isValid){
			// Assinatura válida			
			$('#verification').html('<h1>Assinatura válida!</h1>');

			$('#step5').css('background-color', '#5ca028');
			
			step(5);
		}
		else{
			// Assinatura inválida			
			$('#verification').html('<h1>Assinatura inválida!</h1>');

			$('#step5').css('background-color', '#cc3333');			

			step(5);
		}
	}

	// ===========================================
	
	/*
		Ler a chave privada a partir de um arquivo.
		Simulando o acesso a uma entrada da chave a partir certificado cartão.
	*/
	function loadingPrivateKeyStandard(){
		var result = false;		
		$.ajax({
        async: false,
        type: "GET",
        url: "./assets/key/privatekey.txt",
        dataType: "text",
           contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        success: function (data) {
             _privateKey = data;
             result = true;
           }
        });
        return result;
	}

	/*
		Ler a chave pública a partir de um arquivo.
	*/
	function loadingPublicKeyStandard(){
		var value = "";
		$.ajax({
        async: false,
        type: "GET",
        url: "./assets/key/publickey.txt",
        dataType: "text",
           contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        success: function (data) {
        	value = data;
           }
        });

        return value;
	}

	/* Botão voltar */

	back.click(function(){

		// Reinicializar as entradas de arquivos, 
		// de modo que eles não possuam a última seleção.
		$('#step2 input[type=file]').replaceWith(function(){
			return $(this).clone();
		});

		// Reiniciar variaveis
		_file = null;
		_text_file = "";
		_privateKey = "";
		_publicKey = "";
		_signature = "";
		_text_signature = "";

		// Limpar os campos de texto
		$('#prvkey').val('');
		$('#pubkey').val(loadingPublicKeyStandard());
		$('#signature').val('');

		// voltar a cor do passo 5
		$('#step5').css('background-color', '#26C9FF');

		// limprar o estado da verificação
		$('#verification').html('');		

		// voltar para o passo 1
		step(1);
	});

	/* 
		Função auxiliar que move a janela de exibição para a div do passo i
	*/
	function step(i){

		if(i == 1){
			back.fadeOut();
		}
		else{
			back.fadeIn();
		}

		stage.css('top',(-(i-1)*100)+'%');
	}

});
