import React, {FC, PropsWithChildren, ReactElement} from 'react';
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

type LayoutStatics = {
    Header: FC<PropsWithChildren>;
    Content: FC<PropsWithChildren>;
    Footer: FC<PropsWithChildren>;
};

type LayoutProps = {
    doc?: boolean;
    headerHeight?: number;
};

export const Layout: LayoutStatics & FC<PropsWithChildren<LayoutProps>> = (props) => {
    const {children, doc, headerHeight = 0} = props;
    let header, content, footer;

    React.Children.forEach(children as ReactElement[], (child: ReactElement) => {
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
        <div className={b({'full-header': headerHeight > 0})}>
            {header && <div className={b('header')}>{header}</div>}
            <div className={b('body')}>
                {content && <div className={b('content')}>{content}</div>}
                {footer && <div className={b('footer', {doc})}>{footer}</div>}
            </div>
        </div>
    );
};

Layout.displayName = 'Layout';

Layout.defaultProps = {
    doc: false,
};

Layout.Header = Header;
Layout.Content = Content;
Layout.Footer = Footer;
