export default function Die({value, isHeld, hold}) {
    return (
        <div className={`tenzies__die ${isHeld ? 'tenzies__die--held' : ''}`}>
            <p onClick={hold}>{value}</p>
        </div>
    );
}