// var SimplexNoise = require('simplex-noise');

var Ring = function( parent, radius, id, color ){
	this.parent = parent;
	this.id = id;
	this.radius = radius || 0.5;
	this.osc = 0.1;
	this.intensity = 1;
	this.constrain = 1;
	// this.simplex = new SimplexNoise( Math.random );

	this.theta = 0;
	this.amp = 0.2;

	this.points = [];
	for( var i = 0 ; i < this.parent.circleRes ; i++ ){
		var px = Math.cos( Math.PI * 2 * i / this.parent.circleRes );
		var py = Math.sin( Math.PI * 2 * i / this.parent.circleRes );
		this.points.push( [ px, py ] );
	}

	var geometry = new THREE.BufferGeometry();
	var ps = [0,0,0];
	var is = [];
	for( var i = 0 ; i < this.parent.circleRes ; i++ ) ps.push( 0, 0, 0 );

	for( var i = 0 ; i < this.parent.circleRes ; i++ ) is.push( 0, i, i+1 );
	is.push( 0, this.parent.circleRes, 1 );

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ps ), 3 ) );
	geometry.setIndex( is );

	var material = new THREE.MeshBasicMaterial({ color : new THREE.Color(color), wireframe : false });

	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.scale.set(1000,1000,1000)
	this.parent.scene.add( this.mesh );

	var ps = Math.round( this.parent.circleRes * this.amp );
	this.gauss = [];
	for( var i = 0 ; i <= ps ; i++ ) this.gauss[i] = ( Math.sin( 2 * Math.PI * ( (i/ps) - 0.25 ) ) + 1 ) / 2;
	for( var i = 0 ; i < Math.round( this.parent.circleRes - ps ) / 2 ; i++ ) this.gauss.unshift(0.01);
	for( var i = this.gauss.length ; i < this.parent.circleRes ; i++ ) this.gauss.push(0.01);

	this.mesh.position.z = this.id;
}


Ring.prototype.step = function( time ){
	

	if( this.id == 0 ) {
		this.pps = [];
		for( var i = 0 ; i < this.parent.circleRes ; i++ ){
			var dim1 = ( this.points[i][0] + this.id / 10 ) / ( 1 / this.intensity );
			var dim2 = ( this.points[i][1] + time ) / ( 1 / this.intensity );
			var n = ( ( this.parent.simplex.noise2D( dim1, dim2 ) ) + 1 ) / 2 * this.osc;
			
			// n *= this.gauss[i] ;
			
			this.pps.push([
				Math.cos( Math.PI * 2 * i / this.points.length ) * ( this.radius - n ),
				Math.sin( Math.PI * 2 * i / this.points.length ) * ( this.radius - n ) 
			]);
			this.mesh.geometry.attributes.position.setXYZ( ( i + 1 ), this.pps[i][0], this.pps[i][1], 0 );
		}
	} else {
		this.pps = this.parent.rings[this.id-1].pps;
		for( var i = 0 ; i < this.parent.circleRes ; i++ ){
			var dim1 = ( this.points[i][0] + this.id / 10 ) / ( 1 / this.intensity );
			var dim2 = ( this.points[i][1] + time ) / ( 1 / this.intensity );
			var n = ( ( this.parent.simplex.noise2D( dim1, dim2 ) ) + 1 ) / 2 * this.osc;
			
			// n *= this.gauss[i];

			this.pps[i][0] -= Math.cos( Math.PI * 2 * i / this.points.length ) * ( n )
			this.pps[i][1] -= Math.sin( Math.PI * 2 * i / this.points.length ) * ( n )

			this.mesh.geometry.attributes.position.setXYZ( ( i + 1 ), this.pps[i][0], this.pps[i][1], 0 );
		}
	}

	this.mesh.rotation.z = this.theta * Math.PI * 2;

	this.mesh.geometry.attributes.position.needsUpdate = true;
}

module.exports = Ring;