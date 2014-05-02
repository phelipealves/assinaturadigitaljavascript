$(function(){

	var body = $('body'),
		stage = $('#stage'),
		back = $('a.back');

	// arquivo selecionado
	var _file = null;
	// arquivo em base-64
	var _text_file = '';

	// Chave privada
	var _privateKey = "";
	// Chave pública
	var _publicKey = "";

	// Assinatura do arquivo
	var _signature = "";

	/* Step 1 */

	$('#step1 .encrypt').click(function(){
		body.attr('class', 'encrypt');

		// Go to step 2
		step(2);
	});

	$('#step1 .decrypt').click(function(){
		body.attr('class', 'decrypt');
		step(2);
	});


	/* Step 2 */	

	$('#step2 .button').click(function(){
		// Trigger the file browser dialog
		$(this).parent().find('input').click();
	});

	// Eventos de seleção do arquivo

	$('#step2').on('change', '#encrypt-input', function(e){
		// Verifica se um arquivo foi selecionado
		if(e.target.files.length!=1){
			alert('Selecione um arquivo para assinar!');
			return false;
		}

		_file = e.target.files[0];
		// Arquivo deve conter no máximo 1mb
		if(_file.size > 1024*1024){
			alert('Selecione um arquivo de no máximo 1mb');
			return;
		}

		// Lendo o arquivo em Base64
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            // O método btoa() codifica em base-64.
            _text_file = btoa(binaryString);
        };

        reader.readAsBinaryString(_file);

		step(3);
	});

	$('#step2').on('change', '#decrypt-input', function(e){
		// Verifica se um arquivo foi selecionado
		if(e.target.files.length!=1){
			alert('Selecione um arquivo para verificar!');
			return false;
		}

		_file = e.target.files[0];

		// Lendo o arquivo em Base64
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            // O método btoa() codifica em base-64.
            _text_file = btoa(binaryString);
        };

        reader.readAsBinaryString(_file);

		step(3);
	});

	/* Step 3 */	

	$('#step3 .continue').click(function(){

		if(body.hasClass('encrypt')){
			// Chave privada
			_privateKey = $('#prvkey').val();
		}
		else{
			// Chave pública
			_publicKey = $('#pubkey').val();
		}

		step(4);
	});

	/* Step 4 */

	$('#step4 a.button.sign').click(function(){
		// Criando assinatura do arquivo
		var rsa = new RSAKey();
		rsa.readPrivateKeyFromPEMString(_privateKey);

		var hashAlg = $("#algorithm").val();
		var hSig = rsa.signString(_text_file, hashAlg);
		_signature = linebrk(hSig, 64);

		// Inserindo o link para download do arquivo da assinatura
		var a = $('#step5 a.download');
		a.attr('href', 'data:application/octet-stream,' + _signature);
		a.attr('download', _file.name + '.signature');
		
		step(5);
	});

	
	$('#step4 a.button.check').click(function(){
		// Verifando assinatura do arquivo
		_signature = $("#signature").val();

		var x509 = new X509();
		x509.readCertPEM(_publicKey);
		var isValid = x509.subjectPublicKeyRSA.verifyString(_text_file, _signature);

		if(isValid){
			alert("valido");
		}
		else{
			alert("invalido");
		}

	});
/*
	$('a.button.process').click(function(){

		var input = $(this).parent().find('input[type=password]'),
			a = $('#step4 a.download'),
			password = input.val();

		input.val('');

		if(password.length<5){
			alert('Please choose a longer password!');
			return;
		}

		// The HTML5 FileReader object will allow us to read the 
		// contents of the	selected file.

		var reader = new FileReader();

		if(body.hasClass('encrypt')){

			// Encrypt the file!

			reader.onload = function(e){

				// Use the CryptoJS library and the AES cypher to encrypt the 
				// contents of the file, held in e.target.result, with the password

				var encrypted = CryptoJS.AES.encrypt(e.target.result, password);

				// The download attribute will cause the contents of the href
				// attribute to be downloaded when clicked. The download attribute
				// also holds the name of the file that is offered for download.

				a.attr('href', 'data:application/octet-stream,' + encrypted);
				a.attr('download', file.name + '.encrypted');

				step(5);
			};

			// This will encode the contents of the file into a data-uri.
			// It will trigger the onload handler above, with the result

			reader.readAsDataURL(file);
		}
		else {

			// Decrypt it!

			reader.onload = function(e){

				var decrypted = CryptoJS.AES.decrypt(e.target.result, password)
										.toString(CryptoJS.enc.Latin1);

				if(!/^data:/.test(decrypted)){
					alert("Invalid pass phrase or file! Please try again.");
					return false;
				}

				a.attr('href', decrypted);
				a.attr('download', file.name.replace('.encrypted',''));

				step(5);
			};

			reader.readAsText(file);
		}
	});

	*/
	/* Step 4 */

	/* The back button */

	back.click(function(){

		// Reinitialize the hidden file inputs,
		// so that they don't hold the selection 
		// from last time

		$('#step2 input[type=file]').replaceWith(function(){
			return $(this).clone();
		});

		step(1);
	});


	// Helper function that moves the viewport to the correct step div

	function step(i){

		if(i == 1){
			back.fadeOut();
		}
		else{
			back.fadeIn();
		}

		// Move the #stage div. Changing the top property will trigger
		// a css transition on the element. i-1 because we want the
		// steps to start from 1:

		stage.css('top',(-(i-1)*100)+'%');
	}

});
