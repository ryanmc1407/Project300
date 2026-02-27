import { Component } from '@angular/core';
import { Sidebar } from '../../common-ui/sidebar/sidebar';
import { Footer } from '../../common-ui/footer/footer';
import { Header } from '../../common-ui/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    imports: [Sidebar, Footer, Header, RouterOutlet],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})

export class Dashboard {

}
