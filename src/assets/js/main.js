const Vue       = require( 'vue' );
const Character = require( './Character.js' );
const Timeline  = require( './Timeline.js' );
const Phrase    = require( './Phrase.js' );
const Wait      = require( './Wait.js' );




const character = new Character( 'assets/model/Luchi.min.json', document.querySelector( '.Character' ) );
const tl = new Timeline( character );
// tl.add( new Phrase( 'よもつ さん' ) );
// tl.add( new Wait( 60 ) );
// tl.add( new Phrase( 'お誕生日' ) );
// tl.add( new Phrase( 'おめでとう ございます', { pose: 'bow' } ) );
// tl.add( new Phrase( '素敵な1年を過ごしてくださいね', { emotion: 'happy' } ) );

// character.addEventListener( 'load', function ( event ) {

// 	document.querySelector( '.play button' ).addEventListener( 'click', function () {

// 		tl.play();

// 	} );

// } );

// tl.addEventListener( 'end', function () {

// 	tl.clear();

// } );





var BuilderUI = Vue.extend( {

	props: {
		'list': Array,
		'loaded': Boolean,
		'visible': {
			type: Boolean,
			default: false
		}
	},

	template: `
		<div class="BuilderUI">
			<div class="BuilderUI__header">
				<social></social>
				<button v-on:click="showToggle" disabled="{{ !loaded }}"><span class="icon-cog" aria-label="config"></span></button>
				<button v-on:click="play" disabled="{{ !loaded || list.length===0 }}"><span class="icon-volume"></span>&nbsp;&nbsp;Play</button>
			</div>
			<div class="BuilderUI__input" v-show="visible">
				<ol class="BuilderUI__list">
					<li v-for="item in list" class="BuilderUI__item">
						<div v-if="item.type === 'utter'" class="BuilderUI__itemInner">
							<div class="BuilderUI__">
								<span class="BuilderUI__itemLang">{{ item.lang }}</span> {{ item.text }}
							</div>
							<div class="BuilderUI__itemOptions">
								<span v-if="!!item.pose" class="BuilderUI__itemOption BuilderUI__itemOption--pose">
									pose: {{ item.pose }}
								</span>
								<span v-if="!!item.emotion" class="BuilderUI__itemOption BuilderUI__itemOption--emotion">
									emotion: {{ item.emotion }}
								</span>
							</div>
						</div>
						<div v-if="item.type === 'wait'" class="BuilderUI__itemInner BuilderUI__itemInner--wait">
							wait <code>{{ item.duration }}</code> ms
						</div>
					</li>
				</ol>
				<builder-input :list="list" selected="utter"></builder-input>
				<div class="BuilderUI__footer">
					<button class="Button" v-on:click="clear" :disabled="list.length===0"><span class="icon-trash"></span>&nbsp;&nbsp;Clear all</button>
				</div>
			</div>
		</div>
	`,

	methods: {

		clear: function () {

			// https://jp.vuejs.org/guide/list.html#注意事項
			// this.list.length = 0;
			this.list = [];

		},

		play: function () {

			this.build();
			tl.play();

		},

		build: function () {

			tl.clear();

			this.list.forEach( function ( item ) {

				if ( item.type === 'utter' ) {

					const opts = {

						pose: item.pose,
						text: item.text,
						lang: /^en/.test( item.lang ) ? 'en-US':
						      /^ja/.test( item.lang ) ? 'ja-JP':
						      null,
						pose: item.pose,
						emotion: item.emotion

					}

					tl.add( new Phrase( item.text, opts ) );

				}

				if ( item.type === 'wait' ) {

					tl.add( new Wait( item.duration ) );

				}

			} );

		},

		showToggle: function () {

			this.visible = !this.visible;

		}

	}

} );


var BuilderInput = Vue.extend( {

	props: {
		'list': Array,
		'selected': String,
		'disabled': {
			type: Boolean,
			default: true
		},
		'text': String,
		'lang': {
			type: String,
			default: /ja/.test( navigator.language ) ? 'ja' : 'en'
		},
		'emotion': {
			type: String,
			default: 'none'
		},
		'pose': {
			type: String,
			default: 'none'
		},
		'duration': Number
	},

	template: `
		<form class="BuilderInput" v-on:submit="addItem">
			<div v-if="selected === 'utter'" class="BuilderInput__inputItems">
				
				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						type
					</div>
					<div class="BuilderInput__itemBody">
						<select v-model="selected">
							<option value="utter">Utter</option>
							<option value="wait">Wait</option>
						</select>
					</div>
				</div>

				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						text
					</div>
					<div class="BuilderInput__itemBody">
						<input v-model="text" v-on:change="oninput" v-on:input="oninput">
					</div>
				</div>

				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						lang
					</div>
					<div class="BuilderInput__itemBody">
						<select v-model="lang">
							<option value="en">English</option>
							<option value="ja">Japanese</option>
						</select>
					</div>
				</div>

				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						emotion
					</div>
					<div class="BuilderInput__itemBody">
						<select v-model="emotion">
							<option selected>none</option>
							<option>happy</option>
							<option>upset</option>
							<option>relieved</option>
							<option>confused</option>
							<option>sulk</option>
						</select>
					</div>
				</div>

				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						pose
					</div>
					<div class="BuilderInput__itemBody">
						<select v-model="pose">
							<option selected>none</option>
								<option>nod</option>
								<option>deny</option>
								<option>fistpump</option>
								<option>show</option>
								<option>depressed</option>
								<option>bow</option>
						</select>
					</div>
				</div>
			</div>
			<div v-if="selected === 'wait'" class="BuilderInput__inputItems">
				
				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						type
					</div>
					<div class="BuilderInput__itemBody">
						<select v-model="selected">
							<option value="utter">Utter</option>
							<option value="wait">Wait</option>
						</select>
					</div>
				</div>

				<div class="BuilderInput__item">
					<div class="BuilderInput__itemHead">
						duration
					</div>
					<div class="BuilderInput__itemBody">
						<input type="number" v-model="duration" v-on:change="oninput" v-on:input="oninput"> ms
					</div>
				</div>
			</div>

			<div class="BuilderInput__submit">
				<button class="Button" v-on:click="addItem" :disabled="disabled" type="submit">add item</button>
			</div>
		</form>
	`,

	methods: {

		init: function () {

			this.type     = 'utter';
			this.text     = '';
			// this.lang     = 'en';
			this.pose     = 'none';
			this.emotion  = 'none';
			this.duration = '';
			this.disabled = true;

		},

		addItem: function ( e ) {

			const item = {};

			e.preventDefault();

			if ( this.disabled ) {

				return;

			}

			if ( this.selected === 'utter' ) {

				item.type    = 'utter';
				item.text    = this.text;
				item.lang    = this.lang;
				item.pose    = this.pose === 'none' ? null : this.pose;
				item.emotion = this.emotion === 'none' ? null : this.emotion;

			}

			if ( this.selected === 'wait' ) {

				item.type     = 'wait';
				item.duration = this.duration;

			}

			this.list.push( item );
			this.init();

		},

		oninput: function () {

			if ( this.selected === 'utter' && !/^\s*$/.test( this.text ) ) {

				this.disabled = false;
				return;

			}

			if ( this.selected === 'wait' && /^[0-9]+$/.test( this.duration ) ) {

				this.disabled = false;
				return;

			}

			this.disabled = true;

		}

	}

} );

var Social = Vue.extend( {
	template:`
		<div class="Social">
			Code: <a href="https://twitter.com/yomotsu">@yomotsu</a> | 
			Model by: <a href="https://twitter.com/minchico487">@minchico487</a>
		</div>
	`
} );

Vue.component( 'builder', BuilderUI );
Vue.component( 'builder-input', BuilderInput );
Vue.component( 'social', Social );

const vm = new Vue({

	el: '#App',

	data: {

		loaded: false,

		list: /ja/.test( navigator.language ) ? [
			{
				type: 'utter',
				text: 'よもつ さん',
				lang: 'ja'
			}, {
				type: 'wait',
				duration: 60
			}, {
				type: 'utter',
				text: 'お誕生日',
				lang: 'ja'
			}, {
				type: 'utter',
				text: 'おめでとう ございます',
				lang: 'ja',
				pose: 'bow'
			}, {
				type: 'utter',
				text: '素敵な1年を過ごしてくださいね',
				lang: 'ja',
				emotion: 'happy'
			}, {
				type: 'wait',
				duration: 1000
			}, {
				type: 'utter',
				text: 'ところで、私を喋らせることができるんですよ',
				lang: 'ja',
				pose: 'nod'
			}, {
				type: 'wait',
				duration: 500
			}, {
				type: 'utter',
				text: '左上の設定画面を開いて',
				lang: 'ja'
			}, {
				type: 'wait',
				duration: 200
			}, {
				type: 'utter',
				text: 'テキストを 入力 してみて ください!',
				lang: 'ja',
				emotion: 'happy'
			}
		] : [
			{
				type: 'utter',
				text: 'Happy birthday',
				lang: 'en'
			}, {
				type: 'wait',
				duration: 60
			}, {
				type: 'utter',
				text: 'Yomotsu',
				lang: 'en'
			}, {
				type: 'utter',
				text: ' ',
				lang: 'en',
				pose: 'bow'
			}, {
				type: 'utter',
				text: 'I hope, you have an amazing year, ahead',
				lang: 'en',
				emotion: 'happy'
			}, {
				type: 'wait',
				duration: 1000
			}, {
				type: 'utter',
				text: 'By the way, you can let me talk.',
				lang: 'en',
				pose: 'nod'
			}, {
				type: 'wait',
				duration: 500
			}, {
				type: 'utter',
				text: 'Open the setting, top left corner',
				lang: 'en'
			}, {
				type: 'wait',
				duration: 500
			}, {
				type: 'utter',
				text: 'Then, input some text!',
				lang: 'en',
				emotion: 'happy'
			}
		]
	}

} );

character.addEventListener( 'load', function () {

	vm.$set( 'loaded', true );

} );


// var buttons = document.querySelectorAll( '.BuilderUI__header button' );

// Array.prototype.forEach.call( buttons, function( button ) {

// 	button.disabled = true;

// } );

// character.addEventListener( 'load', function () {

// 	Array.prototype.forEach.call( buttons, function( button ) {

// 		button.disabled = false;

// 	} );

// } );


var file = document.createElement( 'input' );
file.type = 'file';
file.accept = 'application/json';

document.addEventListener( 'keydown', function ( e ) {

	const jKey = 74;

	if (
		e.keyCode === jKey && 
		( e.metaKey === true || e.ctrlKey === true )
	) {

		file.click();

	}

} );

file.addEventListener( 'change', function ( e ) {

	const reader = new FileReader();

	reader.onload = function( e ) {

		vm.$set( 'list', JSON.parse( e.target.result ) );

	}

	reader.readAsText( e.target.files[ 0 ] );

} );



// var main = function () {

// }

// module.exports = main;
