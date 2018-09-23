import React, { Component, Fragment } from "react";
import "./App.css";
class Header extends Component {
  render() {
    return (
      <div id="title">
        My Github Favourites
      </div>
    );
  }
}
class MainContent extends Component {
  state = {
    repositories: [] // name, language, latest_tag, is_added
  };
  onSearch = searchTerm => {
    fetch(
      `http://api.github.com/search/repositories?q=${encodeURI(searchTerm)}`
    )
      .then(response => response.json())
      .then(({ items }) => {
        
        if(!items) return;

        const raw_repositories = items.slice(0, 10);
        //console.log(raw_repositories);
        const tags_requests = raw_repositories.map(i => fetch(i.tags_url));
        //console.log(tags_requests);
        Promise.all(tags_requests).then(responses => {
          const tags_json_requests = responses.map(i => i.json());
          Promise.all(tags_json_requests).then(tags => {
            console.log(tags);
            const latest_tags_versions = tags.map(
              i =>
                typeof i.length === "number" && i.length > 0 && i[0].name
                  ? i[0].name
                  : "-"
            );
            console.log(latest_tags_versions);
            const repositories = raw_repositories.map(
              ({ full_name, language }, index) => ({
                full_name,
                language,
                latest_tags: latest_tags_versions[index],
                is_added: false
              })
            );
            this.setState({ repositories });
            console.log(this.state.repositories);
          });
        });
        // { full_name, language, tags_url }
        // console.log(full_name, language, tags_url);
      });
  };

  onRemove = fullName => {
    this.setState(({ repositories }) => {
      const currentRepository = repositories.filter(
        i => i.full_name === fullName
      )[0];
      currentRepository.is_added = false;
      return { ...repositories, currentRepository };
    });
  };

  onAdd = fullName => {
    this.setState(({ repositories }) => {
      const currentRepository = repositories.filter(
        i => i.full_name === fullName
      )[0];
      currentRepository.is_added = true;
      return { ...repositories, currentRepository };
    });
  };

  render() {
    const { repositories } = this.state;
    return (
      <div id="main">
        <Left
          repositories={repositories}
          submitHandler={this.onSearch}
          removeHandler={this.onRemove}
          addHandler={this.onAdd}
        />
        <Right
          repositories={repositories}
          removeHandler={this.onRemove}
          addHandler={this.onAdd}
        />
      </div>
    );
  }
}
class Left extends Component {
  render() {
    const {
      submitHandler,
      repositories,
      addHandler,
      removeHandler
    } = this.props;
    return (
      <div id="left">
        <Search submitHandler={submitHandler} />
        <List
          side="left"
          repositories={repositories}
          addHandler={addHandler}
          removeHandler={removeHandler}
        />
      </div>
    );
  }
}
class Right extends Component {
  render() {
    const { repositories, addHandler, removeHandler } = this.props;
    return (
      <div id="right">
        <List
          side="right"
          repositories={repositories}
          addHandler={addHandler}
          removeHandler={removeHandler}
        />
      </div>
    );
  }
}
class Search extends Component {
  state = {
    term: ""
  };
  triggerSearch = e => {
    e.preventDefault();
    this.props.submitHandler(this.state.term);
  };
  handleChange = e => {
    this.setState({ term: e.target.value });
  };
  render() {
    return (
      <div id="search" >
        <form onSubmit={this.triggerSearch}>
          <input
            type="text"
            name="term"
            value={this.state.term}
            onChange={this.handleChange}
          />
          <input id="submit" type="submit" value="Search" />
        </form>
      </div>
    );
  }
}
class List extends Component {
  render() {
    const { side, repositories, addHandler, removeHandler } = this.props;
    return (
      <div id={`${side}-list`}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Language</th>
              <th>Latest tag</th>
              <th id="last" />
            </tr>
          </thead>
          <tbody>
            {repositories
              .filter(({ is_added }) => {
                if (side === "right") {
                  return is_added === true;
                } else {
                  return true;
                }
              })
              .map(repository => (
                <tr key={repository.full_name}>
                  <td>{repository.full_name}</td>
                  <td>{repository.language}</td>
                  <td>{repository.latest_tags}</td>
                  <td>
                    {repository.is_added && side === "right" ? (
                      <button
                        onClick={() => removeHandler(repository.full_name)}
                      >
                        Remove
                      </button>
                    ) : !repository.is_added ? (
                      <button onClick={() => addHandler(repository.full_name)}>
                        Add
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}
class App extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <MainContent />
      </Fragment>
    );
  }
}

export default App;
