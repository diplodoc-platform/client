import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import './Layout.scss';

const b = block('Layout');

function Header() {
    return null;
}

function Content() {
    return null;
}

function Footer() {
    return null;
}

export default class Layout extends React.Component {
    static Header = Header;
    static Content = Content;
    static Footer = Footer;

    static propTypes = {
        children: PropTypes.node.isRequired,
        doc: PropTypes.bool,
    };

    static defaultProps = {
        doc: false,
    };

    render() {
        const {children, doc} = this.props;
        let header, content, footer;

        React.Children.forEach(children, (child) => {
            switch (child.type) {
                case Header:
                    header = child.props.children;
                    break;
                case Content:
                    content = child.props.children;
                    break;
                case Footer:
                    footer = child.props.children;
                    break;
            }
        });

        return (
            <div className={b()}>
                {header && <div className={b('header')}>{header}</div>}
                <div className={b('body')}>
                    {content && <div className={b('content')}>{content}</div>}
                    {footer && <div className={b('footer', {doc})}>{footer}</div>}
                </div>
            </div>
        );
    }
}
