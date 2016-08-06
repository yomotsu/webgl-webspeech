const THREE           = require( 'THREE' );
const EventDispatcher = require( './EventDispatcher.js' );

const FADE_ACTION_DURATION = 0.3;

var initScene = function ( character, dom ) {

	// var loaderDiv = document.getElementById( 'loaderProgress' );

	const width  = dom.offsetWidth;
	const height = dom.offsetHeight;
	const clock  = new THREE.Clock();
	const scene  = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 40, width / height, 1, 100 );
	camera.position.set( 0, 0.8, 3 );
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( width, height );
	dom.appendChild( renderer.domElement );

	// controls = new THREE.OrbitControls( camera, renderer.domElement );
	// controls.enableDamping = true;
	// controls.dampingFactor = 0.25;
	// controls.enableZoom = false;
	// controls.target = new THREE.Vector3( 0, 0.8, 0 );

	scene.add(
		new THREE.HemisphereLight( 0x443333, 0x332222, 2 ),
		new THREE.AmbientLight( 0x999999 ),
		character.mesh
	);

	( function anim () {

		const elapsed = clock.getElapsedTime();

		// if ( elapsed > 20 ) { return; }

		requestAnimationFrame( anim );

		character.update();
  	renderer.render( scene, camera );

	} )();

	window.addEventListener( 'resize', function () {

		const width  = dom.offsetWidth;
		const height = dom.offsetHeight;

		renderer.setSize( width, height );
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

	} );

}

module.exports = class Character extends EventDispatcher {

	constructor ( url, dom ) {

		const loader = new THREE.JSONLoader();

    super();

		this.mouthAnimWeight = 0;
		this._mouthAnimWeightTo = 0;
		this.clock = new THREE.Clock();
		this.mesh = new THREE.Object3D();
		this.action = {};
		this.isLoaded = false;

		/// あとでリファクタリングする
		var loaderDiv = document.createElement( 'div' );
		loaderDiv.id = 'loaderProgress';
		loaderDiv.innerHTML = 'Turn on sound.<br>Loading 0%';
		dom.appendChild( loaderDiv );

		loader.manager.onProgress = function ( item, loaded, total ) {

			loaderDiv.innerHTML = 'Turn on sound.<br>Loading ' + ( ( loaded / total * 100 ) | 0 ) + '%';

		}

		loader.manager.onLoad = function () {

			loaderDiv.parentNode.removeChild( loaderDiv );

		}
		///

		loader.load( url, function( geometry, materials ) {

			materials[ 0 ].skinning = true;
			materials[ 0 ].morphTargets = true;

			this.mesh = new THREE.SkinnedMesh(
				geometry,
				new THREE.MeshFaceMaterial( materials )
			);

			this.mixer = new THREE.AnimationMixer( this.mesh );

			this.action.idle      = this.mixer.clipAction( geometry.animations[ 0 ] );
			this.action.nod       = this.mixer.clipAction( geometry.animations[ 1 ] );
			this.action.deny      = this.mixer.clipAction( geometry.animations[ 2 ] );
			this.action.fistpump  = this.mixer.clipAction( geometry.animations[ 3 ] );
			this.action.show      = this.mixer.clipAction( geometry.animations[ 4 ] );
			this.action.depressed = this.mixer.clipAction( geometry.animations[ 5 ] );
			this.action.bow       = this.mixer.clipAction( geometry.animations[ 6 ] );

			this.action.idle     .setEffectiveWeight( 1 );
			this.action.nod      .setEffectiveWeight( 1 );
			this.action.deny     .setEffectiveWeight( 1 );
			this.action.fistpump .setEffectiveWeight( 1 );
			this.action.show     .setEffectiveWeight( 1 );
			this.action.depressed.setEffectiveWeight( 1 );
			this.action.bow      .setEffectiveWeight( 1 );

			this.action.nod      .setLoop( THREE.LoopOnce, 0 );
			this.action.deny     .setLoop( THREE.LoopOnce, 0 );
			this.action.fistpump .setLoop( THREE.LoopOnce, 0 );
			this.action.show     .setLoop( THREE.LoopOnce, 0 );
			this.action.depressed.setLoop( THREE.LoopOnce, 0 );
			this.action.bow      .setLoop( THREE.LoopOnce, 0 );

			this.action.nod      .clampWhenFinished = true;
			this.action.deny     .clampWhenFinished = true;
			this.action.fistpump .clampWhenFinished = true;
			this.action.show     .clampWhenFinished = true;
			this.action.depressed.clampWhenFinished = true;
			this.action.bow      .clampWhenFinished = true;

			this.action.idle     .enabled = true;
			this.action.nod      .enabled = false;
			this.action.deny     .enabled = false;
			this.action.fistpump .enabled = false;
			this.action.show     .enabled = false;
			this.action.depressed.enabled = false;
			this.action.bow      .enabled = false;

			this.action.idle.play();

			this.currentEmotion = 'none';

			this.isLoaded = true;

			this.dispatchEvent( { type: 'load' } );

			if ( !!dom ) { initScene( this, dom ); }

		}.bind( this ) );

	}

	setMouthAnimWeight ( value ) {

		this._mouthAnimWeightTo = value;

	}

	setPose ( poseId ) {

		if ( !!poseId && poseId !== 'idle' ) {

			this.fadeAction( poseId );

			this.mixer.addEventListener( 'finished', function ( event ) {

				this.fadeAction( 'idle' );

			}.bind( this ) );

			return this.action[ poseId ]._clip.duration + FADE_ACTION_DURATION;

		}

		return 0;

	}

	setEmotion ( emotionId ) {

		this.currentEmotion = !emotionId ? 'none' : emotionId;

	}

	updateEmotion ( elapsed, delta ) {

		const lookup = {
			happy   : 0,
			upset   : 1,
			relieved: 2,
			confused: 4,
			sulk    : 5
		};

		for ( let i in lookup ) {

			const emotionId = lookup[ i ];

			if ( i === this.currentEmotion ) {

				const weight = Math.min( this.mesh.morphTargetInfluences[ emotionId ] + delta * 5, 1 );
				this.mesh.morphTargetInfluences[ emotionId ] = weight;

			} else {

				const weight = Math.max( this.mesh.morphTargetInfluences[ emotionId ] - delta * 5, 0 );
				this.mesh.morphTargetInfluences[ emotionId ] = weight;

			}

		}

	}

	updateMouthAnim ( elapsed, delta ) {

		const weight = this.mouthAnimWeight + ( this._mouthAnimWeightTo - this.mouthAnimWeight ) * delta * 50;
		let influence;

		this.mouthAnimWeight = THREE.Math.clamp( weight, 0, 1 );
		influence = ( Math.sin( elapsed * 30 ) * 0.4 + 0.6 ) * this.mouthAnimWeight;
		this.mesh.morphTargetInfluences[ 3 ] = influence; //O

	}

	fadeAction ( name ) {

		if ( !this._activeActionName ) {

			this._activeActionName = 'idle';

		}

		const from = this.action[ this._activeActionName ].play();
		const to   = this.action[ name ].play();

		from.enabled = true;
		to.enabled   = true;

		if ( to.loop === THREE.LoopOnce ) {

			to.reset();

		}

		from.crossFadeTo( to, FADE_ACTION_DURATION );
		this._activeActionName = name;

	}

	update() {

		if ( !this.isLoaded ) { return; }

		const delta = this.clock.getDelta();
		const elapsed = this.clock.getElapsedTime();

		this.updateMouthAnim( elapsed, delta );
		this.updateEmotion( elapsed, delta );
		this.mixer.update( delta );

	}

}
