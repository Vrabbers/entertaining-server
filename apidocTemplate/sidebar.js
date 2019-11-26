class Sidebar extends React.Component {
    renderElements() {
        let els = [];
        
        if (this.props.pjData.header) {
            let clickHandler = () => {
                this.props.setCurrentCall("header");
            };
            
            els.push(<div className={`item ${this.props.currentCall === "header" ? 'selected' : ''}`} onClick={clickHandler}>
                {this.props.pjData.header.title}
            </div>);
        }
        
        //Sort the calls into groups
        let groups = {};
        for (let call of this.props.data) {
            if (!groups[call.groupTitle]) groups[call.groupTitle] = [];
            groups[call.groupTitle].push(call);
        }
        
        for (let group in groups) {
            els.push(<h2>{group}</h2>)
            for (let call of groups[group]) {
            let clickHandler = () => {
                this.props.setCurrentCall(call);
            };
            
            els.push(<div className={`item ${this.props.currentCall === call ? 'selected' : ''}`} onClick={clickHandler}>
                {call.title}
            </div>);
            }
        }
        
        els.push(<div className="sidebarFooter">Generated by <a href={this.props.pjData.generator.url}>{this.props.pjData.generator.name}</a></div>);
        
        return els;
    }
    
    render() {
        return <div className="sidebar">
            <Header title="Entertaining Games" />
            {this.renderElements()}
        </div>
    }
}