import React from 'react';
import { useParams } from 'react-router-dom';
import ColumnAuction from '../components/ColumnAuction';

export default function Auction() {
    const { name } = useParams();

    return (
        <div>
            <section className="container">
                <ColumnAuction name={name || ''} />
            </section>
        </div>
    );
}
