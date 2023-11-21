import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

/* Theme variables */
import { Protected } from './components/routing/Protected';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path='/' component={LoginPage} />
        <Protected userRole='user'>
          <Route exact path='/app'>
            user
          </Route>
        </Protected>
        <Protected userRole='admin'>
          <Route exact path='/admin' component={AdminPage} />
        </Protected>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
