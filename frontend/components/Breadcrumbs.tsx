import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="flex items-center text-xs font-medium" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        to="/admin/dashboard"
                        className="text-[var(--color-text-secondary)] hover:text-blue-600 transition-colors"
                    >
                        Admin
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                    // Skip "admin" prefix as it's the root for breadcrumbs
                    if (value === 'admin') return null;

                    return (
                        <React.Fragment key={to}>
                            <li className="text-slate-400">
                                <i className="fas fa-chevron-right text-[8px]"></i>
                            </li>
                            <li>
                                {last ? (
                                    <span className="text-[var(--color-text-primary)] font-bold capitalize">
                                        {value.replace(/-/g, ' ')}
                                    </span>
                                ) : (
                                    <Link
                                        to={to}
                                        className="text-[var(--color-text-secondary)] hover:text-blue-600 transition-colors capitalize"
                                    >
                                        {value.replace(/-/g, ' ')}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};
