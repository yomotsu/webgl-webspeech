// 初めてgetVoiceするとChromeで空の配列しか返ってこない。
// 一度アクセスしておく。
window.speechSynthesis.getVoices();

module.exports = class Phrase {

	constructor ( text, params ) {

		this.text = text;
		this.pose = params ? params.pose : 'idle';
		this.emotion = params ? params.emotion : null;
		this.lang = params ? params.lang: 'ja-JP';
		this.voice = this.getVoice();

	}

	talk ( character ) {

		const text  = this.text;
		const lang  = this.lang;
		const voice = this.voice;

		return new Promise( function ( resolve, reject ) {

			const utter = new SpeechSynthesisUtterance();
			utter.voiceURI = 'native';
			utter.volume   = 1;
			utter.rate     = 1;
			utter.pitch    = voice && voice.name === 'Kyoko' ? 1.5 : 1;
			utter.text     = text;
			utter.lang     = lang;
			utter.voice    = voice;

			utter.onend = function( e ) {

				character.setMouthAnimWeight( 0 );
				speechSynthesis.cancel();
				delete window._utter;
				resolve();

			};

			// ChromeとSafari で onend が発火しないバグがある
			// onend前に勝手にガベージコレクトされないように
			// 参照を切らないようにすることで安定する
			// https://bugs.chromium.org/p/chromium/issues/detail?id=509488
			// http://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working#comment36226108_23483990
			window._utter = utter;

			character.setMouthAnimWeight( 1 );
			speechSynthesis.speak( utter );


			// onend が発火しない場合の対策
			( function _watchUtter () {

				if ( window.speechSynthesis.speaking ) {

					window.setTimeout( _watchUtter, 200 );
					return;

				}

				character.setMouthAnimWeight( 0 );
				speechSynthesis.cancel();
				delete window._utter;
				resolve();
				return;

			} )();

		} );

	}

	getVoice ( langCode ) {

		const lang = /ja/.test( this.lang ) ? 'ja' : 'en';
		const voices = window.speechSynthesis.getVoices();
		let result;

		voices.some( function ( v ) {

			if (
				lang === 'ja' &&
				v.name === 'Kyoko'
			) {

				result = v;
				return true;

			}

			if (
				lang === 'en' &&
				v.name === 'Agnes'
			) {


				result = v;
				return true;

			}

		} );

			return result;

	}

	startPose ( character ) {

		const duration = character.setPose( this.pose );

		return new Promise( function( resolve, reject ) {

			setTimeout( function () {

				resolve();

			}, duration * 1000 );

		} );

	}

	startEmotion ( character ) {

		character.setEmotion( this.emotion );

	}

	exec ( character ) {

		const that = this;

		return new Promise( function ( resolve, reject ) {

			that.startEmotion( character );

			Promise.all( [
				that.talk( character ),
				that.startPose( character )
			] ).then( function () {

				resolve();

			} );

		} );

	}

}
