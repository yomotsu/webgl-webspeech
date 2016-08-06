module.exports = class Wait {

	constructor ( ms ) {

		this.duration = ms;
		// this.pose = null;
		// this.emotion = null;

	}

	exec ( character ) {

		const duration = this.duration;

		character.setMouthAnimWeight( 0 );

		return new Promise( function ( resolve, reject ) {

			setTimeout( function () {

				resolve();

			}, duration );

		} );

	}

}
