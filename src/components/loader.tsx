import './style/loader.css'

const Loader = () => {
    return (
        <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span className="loader"></span>
        </div>
    );
};

export default Loader;