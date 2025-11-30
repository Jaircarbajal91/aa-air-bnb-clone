import github from '../Navigation/images/github.svg'
import linkedin from '../Navigation/images/linkedin.svg'
import angellist from '../Navigation/images/angellsit.svg'
import greet from '../Navigation/images/greet.svg'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className='footer-content-container'>
        <a href="https://jaircarbajal91.github.io/my-portfolio/" target="_blank" rel="noopener noreferrer">
          <img src={greet} alt="" />
          <span>Meet the developer</span>
        </a>
        <a href="https://www.linkedin.com/in/jair-carbajal/" target="_blank" rel="noopener noreferrer">
          <img src={linkedin} alt="" />
          <span>LinkedIn</span>
        </a>
        <a href="https://github.com/Jaircarbajal91" target="_blank" rel="noopener noreferrer">
          <img src={github} alt="" />
          <span>Github</span>
        </a>
        <a href="https://angel.co/u/jair-carbajal" target="_blank" rel="noopener noreferrer">
        <img src={angellist} alt="" />
        <span>AngelList</span>
        </a>
      </div>
    </footer>
  )
}

export default Footer
