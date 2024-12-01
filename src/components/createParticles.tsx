  //****************************particle pop start
  export const createParticles = (x: number, y: number, zoomScale: number, operation: string) => {
    let transform: string = '';
    let particleCount: number = 0;

    if(operation === 'delete') {     
      particleCount = Math.floor(Math.random() * 6) + 5;
    } // Random number between 5 and 10 
    else if(operation === 'keep') {
      particleCount = 2;
     } 

    for (let i = 0; i < particleCount; i++) {
      if(operation === 'delete') {
        // zoomScale is added so that the particles are bigger when zoomed in and smaller when zoomed out
        transform = `translate(-50%, -50%) translate(${(Math.random() * 200 - 100) * zoomScale}px, ${(Math.random() * 200 - 100) * zoomScale}px)`
        createParticle(x, y, zoomScale, '', transform);
      } else if(operation === 'keep') {
        transform = `translate(500%, -500%)`
        createParticle(x, y, zoomScale, transform, '');
      }
    }
  }

  const createParticle = (x: number, y: number, zoomScale:number, transform1: string, transform2: string) => {
    const particle = document.createElement('particle');
    document.body.appendChild(particle);

    // Calculate a random size from 5px to 25px
    // zoomScale is added so that the particles are bigger when zoomed in and smaller when zoomed out
    const size = Math.floor(Math.random() * 20 + 5) * zoomScale;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Generate a random color
    particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;

    // Position the particle at the mouse coordinates
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.pointerEvents = 'none';
    particle.style.borderRadius = '50%';
    particle.style.zIndex = '1000';

    // Animate the particle
    const animation = particle.animate(
      [
        {
          transform: transform1,
          opacity: 1,
        },
        {
          transform: transform2,
          opacity: 0,
        },
      ],
      {
        duration: 1000 + Math.random() * 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        iterations: 1,
        fill: 'both',
      }
    );

    // Remove the particle after the animation is done
    animation.onfinish = () => {
      particle.remove();
    };
  };
//***********************************particle pop ends

export default createParticles;