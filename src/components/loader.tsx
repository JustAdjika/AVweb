import './style/loader.css'

const Loader = ({ style }: { style?: object }) => {
    return (
        <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
            <span className="loader"></span>
        </div>
    );
};

export default Loader;