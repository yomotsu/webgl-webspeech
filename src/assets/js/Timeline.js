const EventDispatcher = require( './EventDispatcher.js' );

module.exports = class Timeline extends EventDispatcher {

	constructor ( character ) {

		super();

		const before = {
			exec: function () {

				character.setPose();
				character.setEmotion();
				character.setMouthAnimWeight( 1 );

			}.bind( this )
		};

		const after = {
			exec: function () {

				character.setPose();
				character.setEmotion();
				character.setMouthAnimWeight( 0 );
				this.dispatchEvent( { type: 'end' } );

			}.bind( this )
		};

		this.character = character;
		this.queue = [ before, after ];

	}

	add ( phrase ) {

		this.queue.splice( this.queue.length - 1, 0, phrase );

	}

	play () {

		const character = this.character;

		this.queue.reduce( function ( promise, phrase ) {

			return promise.then( function () {

				return phrase.exec( character );

			} );

		}, Promise.resolve() );

	}

	clear () {

		// 先頭と最後を残して削除
		this.queue.splice( 1, this.queue.length - 2 );

	}

}
